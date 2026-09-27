import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  company: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  status: z
    .enum([
      "new_reply",
      "interested",
      "quotation",
      "negotiation",
      "won",
      "lost",
    ])
    .optional(),
  primary_owner_id: z.string().uuid().optional().nullable(),
  marketing_opt_out: z.boolean().optional(),
  phones: z
    .array(
      z.object({
        phone_number: z.string().min(7, "Phone number too short"),
        country_code: z.string().default("+91"),
        is_primary: z.boolean().default(false),
      }),
    )
    .min(1, "At least one phone number is required"),
  tag_ids: z.array(z.string().uuid()).optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const customerFilterSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum([
      "new_reply",
      "interested",
      "quotation",
      "negotiation",
      "won",
      "lost",
    ])
    .optional(),
  tag_id: z.string().uuid().optional(),
  city: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  archived: z.boolean().optional().default(false),
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(200).optional().default(50),
});

export type CustomerFilterValues = z.infer<typeof customerFilterSchema>;
