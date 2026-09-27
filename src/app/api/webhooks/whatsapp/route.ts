import { type NextRequest, NextResponse } from "next/server";
import { whatsAppService } from "@/lib/whatsapp/service";
import { createClient } from "@supabase/supabase-js";
import { normalizePhone } from "@/lib/helpers/format";
import type { Database } from "@/types/supabase";

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ─── GET: Meta Webhook Verification ──────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && challenge) {
    const valid = whatsAppService.verifyWebhookChallenge(token, challenge);
    if (valid) {
      return new NextResponse(challenge, { status: 200 });
    }
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ─── POST: Meta Webhook Event Ingestion ──────────────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || "";

  if (!whatsAppService.validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  const supabase = getAdminClient();

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const val = change.value;
      if (!val) continue;

      // 1. Handle Message Status Updates (Delivered, Read, Failed)
      if (val.statuses && val.statuses.length > 0) {
        for (const statusObj of val.statuses) {
          const wamid = statusObj.id;
          const newStatus = statusObj.status; // 'sent' | 'delivered' | 'read' | 'failed'
          const timestamp = new Date(
            parseInt(statusObj.timestamp, 10) * 1000,
          ).toISOString();

          // Update messages table
          const updateData: any = { status: newStatus };
          if (newStatus === "delivered") updateData.delivered_at = timestamp;
          if (newStatus === "read") updateData.read_at = timestamp;

          await supabase
            .from("messages")
            .update(updateData)
            .eq("whatsapp_message_id", wamid);

          // Update campaign recipient if linked
          if (newStatus === "delivered") {
            await supabase
              .from("campaign_recipients")
              .update({ delivered_at: timestamp, status: "delivered" })
              .eq("message_id", wamid);
          } else if (newStatus === "read") {
            await supabase
              .from("campaign_recipients")
              .update({ read_at: timestamp, status: "read" })
              .eq("message_id", wamid);
          } else if (newStatus === "failed") {
            await supabase
              .from("campaign_recipients")
              .update({
                failed_at: timestamp,
                status: "failed",
                error_details:
                  statusObj.errors?.[0]?.title || "Delivery failed",
              })
              .eq("message_id", wamid);
          }
        }
      }

      // 2. Handle Inbound Messages from Customers
      if (val.messages && val.messages.length > 0) {
        const contact = val.contacts?.[0];
        const senderProfileName = contact?.profile?.name || "WhatsApp Customer";

        for (const msg of val.messages) {
          const wamid = msg.id;
          const rawFrom = msg.from;
          const normPhone = normalizePhone(rawFrom);
          const msgType = msg.type; // 'text' | 'image' | 'document' | 'video'
          const textContent =
            msg.text?.body || (msgType !== "text" ? `[${msgType}]` : "");
          const timestamp = new Date(
            parseInt(msg.timestamp, 10) * 1000,
          ).toISOString();

          // Check if message was already ingested (idempotent)
          const { data: existingMsg } = await supabase
            .from("messages")
            .select("id")
            .eq("whatsapp_message_id", wamid)
            .maybeSingle();

          if (existingMsg) continue;

          // Find customer by phone number
          const { data: phoneRecord } = await supabase
            .from("customer_phones")
            .select("customer_id, customer:customers(id, name)")
            .ilike("phone_number", `%${normPhone.slice(-10)}%`)
            .maybeSingle();

          let customerId = phoneRecord?.customer_id;

          // Auto-create customer if unknown number
          if (!customerId) {
            const { data: newCust } = await supabase
              .from("customers")
              .insert({
                name: senderProfileName,
                source: "WhatsApp Inbound",
                status: "new_reply",
              })
              .select("id")
              .single();

            if (newCust) {
              customerId = newCust.id;
              // Create phone record
              await supabase.from("customer_phones").insert({
                customer_id: customerId,
                phone_number: normPhone,
                country_code: "+91",
                is_primary: true,
              });
            }
          }

          if (!customerId) continue;

          // Check or create open conversation
          let { data: conv } = await supabase
            .from("conversations")
            .select("id, unread_count")
            .eq("customer_id", customerId)
            .eq("state", "open")
            .maybeSingle();

          if (!conv) {
            const { data: newConv } = await supabase
              .from("conversations")
              .insert({
                customer_id: customerId,
                state: "open",
                last_message_at: timestamp,
                last_customer_message_at: timestamp,
                unread_count: 1,
              })
              .select("id, unread_count")
              .single();
            conv = newConv;
          } else {
            // Update conversation timestamps & unread counter
            await supabase
              .from("conversations")
              .update({
                last_message_at: timestamp,
                last_customer_message_at: timestamp,
                unread_count: (conv.unread_count || 0) + 1,
              })
              .eq("id", conv.id);
          }

          if (!conv) continue;

          // Check if this reply can be attributed to recent campaign
          const { data: recentRecipient } = await supabase
            .from("campaign_recipients")
            .select("campaign_id")
            .eq("customer_id", customerId)
            .is("replied_at", null)
            .order("sent_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const attributedCampaignId = recentRecipient?.campaign_id || null;

          if (attributedCampaignId) {
            await supabase
              .from("campaign_recipients")
              .update({ replied_at: timestamp })
              .eq("customer_id", customerId)
              .eq("campaign_id", attributedCampaignId);
          }

          // Insert inbound message record
          await supabase.from("messages").insert({
            conversation_id: conv.id,
            customer_id: customerId,
            direction: "inbound",
            message_type:
              msgType === "image" ||
              msgType === "video" ||
              msgType === "document"
                ? msgType
                : "text",
            content: textContent,
            whatsapp_message_id: wamid,
            status: "read",
            attributed_campaign_id: attributedCampaignId,
            created_at: timestamp,
          });

          // Insert activity log
          await supabase.from("activities").insert({
            customer_id: customerId,
            conversation_id: conv.id,
            activity_type: "message_received",
            description: `Received WhatsApp reply: "${textContent.slice(0, 40)}"`,
          });
        }
      }
    }
  }

  return NextResponse.json({ status: "success" }, { status: 200 });
}
