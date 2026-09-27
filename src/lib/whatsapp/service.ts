import crypto from "crypto";

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppService {
  sendText(to: string, text: string): Promise<MessageResult>;
  sendTemplate(
    to: string,
    templateName: string,
    languageCode?: string,
    variables?: string[],
    mediaUrl?: string,
  ): Promise<MessageResult>;
  sendMedia(
    to: string,
    mediaType: "image" | "video" | "document",
    mediaUrl: string,
    caption?: string,
  ): Promise<MessageResult>;
  validateWebhookSignature(rawBody: string, signature: string): boolean;
  verifyWebhookChallenge(token: string, challenge: string): string | null;
}

export class MetaWhatsAppAdapter implements WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private verifyToken: string;
  private appSecret: string;
  private apiVersion = "v20.0";

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "";
    this.appSecret = process.env.WHATSAPP_APP_SECRET || "";
  }

  private get apiUrl() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  async sendText(to: string, text: string): Promise<MessageResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      // Return mock success in development/staging mode
      console.log(`[WhatsApp Mock] Sending text to ${to}: ${text}`);
      return { success: true, messageId: `mock_msg_${Date.now()}` };
    }

    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to.replace(/\D/g, ""),
          type: "text",
          text: { preview_url: true, body: text },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || "Meta API error",
        };
      }

      return { success: true, messageId: json.messages?.[0]?.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode = "en",
    variables: string[] = [],
    mediaUrl?: string,
  ): Promise<MessageResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.log(
        `[WhatsApp Mock] Sending template "${templateName}" to ${to}`,
      );
      return { success: true, messageId: `mock_tpl_${Date.now()}` };
    }

    try {
      const components: any[] = [];

      if (mediaUrl) {
        components.push({
          type: "header",
          parameters: [
            {
              type: "document",
              document: { link: mediaUrl },
            },
          ],
        });
      }

      if (variables.length > 0) {
        components.push({
          type: "body",
          parameters: variables.map((v) => ({ type: "text", text: v })),
        });
      }

      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components.length > 0 ? components : undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || "Meta Template API error",
        };
      }

      return { success: true, messageId: json.messages?.[0]?.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  async sendMedia(
    to: string,
    mediaType: "image" | "video" | "document",
    mediaUrl: string,
    caption?: string,
  ): Promise<MessageResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.log(`[WhatsApp Mock] Sending media (${mediaType}) to ${to}`);
      return { success: true, messageId: `mock_media_${Date.now()}` };
    }

    try {
      const mediaPayload: Record<string, any> = { link: mediaUrl };
      if (
        caption &&
        (mediaType === "image" ||
          mediaType === "video" ||
          mediaType === "document")
      ) {
        mediaPayload.caption = caption;
      }

      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: mediaType,
          [mediaType]: mediaPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: json.error?.message || "Meta Media API error",
        };
      }

      return { success: true, messageId: json.messages?.[0]?.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  }

  validateWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.appSecret) return true; // Bypass in local development
    try {
      const hash = crypto
        .createHmac("sha256", this.appSecret)
        .update(rawBody)
        .digest("hex");
      const expected = `sha256=${hash}`;
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature),
      );
    } catch {
      return false;
    }
  }

  verifyWebhookChallenge(token: string, challenge: string): string | null {
    if (token === this.verifyToken || !this.verifyToken) {
      return challenge;
    }
    return null;
  }
}

export const whatsAppService = new MetaWhatsAppAdapter();
