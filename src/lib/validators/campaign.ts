import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  template_id: z
    .string()
    .uuid("Select an approved template")
    .optional()
    .nullable(),
  audience_type: z.enum(["all", "filtered"]),
  audience_filters: z
    .object({
      tag_ids: z.array(z.string().uuid()).optional(),
      status: z
        .array(
          z.enum([
            "new_reply",
            "interested",
            "quotation",
            "negotiation",
            "won",
            "lost",
          ]),
        )
        .optional(),
      city: z.string().optional(),
    })
    .optional(),
  scheduled_at: z.string().optional().nullable(),
});

export type CampaignFormValues = z.infer<typeof campaignSchema>;

export const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  content: z.string().min(1, "Template content is required"),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;
