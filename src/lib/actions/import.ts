"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/helpers/format";
import type { Database } from "@/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];

export interface ImportRow {
  name: string;
  mobile: string;
  email?: string;
  company?: string;
  city?: string;
  industry?: string;
  source?: string;
  status?: string;
}

export interface ImportValidationResult {
  total: number;
  valid: number;
  duplicates: number;
  errors: { row: number; reason: string; data: Record<string, string> }[];
  validRows: ImportRow[];
}

export async function validateImportRows(
  rows: Record<string, string>[],
  columnMap: {
    name: string;
    mobile: string;
    email?: string;
    company?: string;
    city?: string;
    industry?: string;
    source?: string;
    status?: string;
  },
): Promise<ImportValidationResult> {
  const supabase = await createClient();

  // Fetch existing customer names and phones for duplicate checking
  const { data: existingCustomers } = await supabase
    .from("customers")
    .select("name, phones:customer_phones(phone_number)")
    .is("archived_at", null);

  const existingMap = new Set<string>();
  for (const ec of existingCustomers ?? []) {
    const normName = ec.name.trim().toLowerCase();
    for (const p of ec.phones ?? []) {
      const normPhone = normalizePhone(p.phone_number);
      existingMap.add(`${normName}|${normPhone}`);
    }
  }

  const seenInFile = new Set<string>();
  const errors: {
    row: number;
    reason: string;
    data: Record<string, string>;
  }[] = [];
  const validRows: ImportRow[] = [];
  let duplicateCount = 0;

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const name = (row[columnMap.name] || "").trim();
    const rawMobile = (row[columnMap.mobile] || "").trim();
    const mobile = normalizePhone(rawMobile);
    const email = columnMap.email ? (row[columnMap.email] || "").trim() : "";
    const company = columnMap.company
      ? (row[columnMap.company] || "").trim()
      : "";
    const city = columnMap.city ? (row[columnMap.city] || "").trim() : "";
    const industry = columnMap.industry
      ? (row[columnMap.industry] || "").trim()
      : "";
    const source = columnMap.source
      ? (row[columnMap.source] || "").trim()
      : "CSV Import";
    const rawStatus = columnMap.status
      ? (row[columnMap.status] || "").trim().toLowerCase().replace(/\s+/g, "_")
      : "new_reply";

    if (!name) {
      errors.push({
        row: rowNum,
        reason: "Customer Name is missing",
        data: row,
      });
      return;
    }

    if (!mobile || mobile.length < 7) {
      errors.push({
        row: rowNum,
        reason: `Invalid Mobile Number: "${rawMobile}"`,
        data: row,
      });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({
        row: rowNum,
        reason: `Invalid Email: "${email}"`,
        data: row,
      });
      return;
    }

    const key = `${name.toLowerCase()}|${mobile}`;
    if (existingMap.has(key) || seenInFile.has(key)) {
      duplicateCount++;
      errors.push({
        row: rowNum,
        reason: `Duplicate customer (Same Name & Mobile: ${name} / ${rawMobile})`,
        data: row,
      });
      return;
    }

    seenInFile.add(key);
    validRows.push({
      name,
      mobile,
      email: email || undefined,
      company: company || undefined,
      city: city || undefined,
      industry: industry || undefined,
      source: source || undefined,
      status: [
        "new_reply",
        "interested",
        "quotation",
        "negotiation",
        "won",
        "lost",
      ].includes(rawStatus)
        ? rawStatus
        : "new_reply",
    });
  });

  return {
    total: rows.length,
    valid: validRows.length,
    duplicates: duplicateCount,
    errors,
    validRows,
  };
}

export async function executeCustomerImport(validRows: ImportRow[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let importedCount = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const chunk = validRows.slice(i, i + BATCH_SIZE);

    const customerInserts = chunk.map((r) => ({
      name: r.name,
      company: r.company || null,
      email: r.email || null,
      city: r.city || null,
      industry: r.industry || null,
      source: r.source || "Import",
      status: (r.status || "new_reply") as CustomerStatus,
      primary_owner_id: profile?.id || null,
    }));

    const { data: createdCustomers, error } = await supabase
      .from("customers")
      .insert(customerInserts)
      .select("id");

    if (error) {
      console.error("Batch insert error:", error);
      continue;
    }

    if (createdCustomers && createdCustomers.length > 0) {
      const phoneInserts = createdCustomers.map((cust, idx) => ({
        customer_id: cust.id,
        phone_number: chunk[idx].mobile,
        country_code: "+91",
        is_primary: true,
      }));

      await supabase.from("customer_phones").insert(phoneInserts);
      importedCount += createdCustomers.length;
    }
  }

  // Create import activity
  if (profile) {
    await supabase.from("activities").insert({
      user_id: profile.id,
      activity_type: "customers_imported",
      description: `Successfully imported ${importedCount} customers via CSV/XLSX`,
    });
  }

  revalidatePath("/customers");
  return { success: true, imported: importedCount };
}
