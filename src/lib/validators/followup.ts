import { z } from 'zod'

export const followupSchema = z.object({
  customer_id: z.string().uuid('Customer is required'),
  description: z.string().min(1, 'Task description is required'),
  due_date: z.string().min(1, 'Due date is required'),
  due_time: z.string().optional().nullable(),
  assigned_user_id: z.string().uuid().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  reminder_minutes: z.number().int().min(0).default(30),
})

export type FollowupFormValues = z.infer<typeof followupSchema>

export const followupFilterSchema = z.object({
  filter: z.enum(['today', 'upcoming', 'overdue', 'completed', 'all']).optional().default('all'),
  assigned_user_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

export type FollowupFilterValues = z.infer<typeof followupFilterSchema>
