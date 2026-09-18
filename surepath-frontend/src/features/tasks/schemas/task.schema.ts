import { z } from "zod";

export const taskAssignedToSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string().nullable(),
});

export const merchantTaskSchema = z.object({
  id: z.string(),
  merchant_id: z.string(),
  merchant_domain: z.string(),
  merchant_store_name: z.string().nullable(),
  assigned_to_id: z.string().nullable(),
  assigned_to: taskAssignedToSchema.nullable(),
  title: z.string(),
  notes: z.string().nullable(),
  due_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_by: z.string().nullable(),
  created_at: z.string(),
});

export const merchantTasksSchema = z.array(
  merchantTaskSchema
);