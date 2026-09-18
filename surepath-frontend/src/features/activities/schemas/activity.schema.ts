import { z } from "zod";

export const activityLoggedBySchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string().nullable(),
});

export const merchantActivitySchema = z.object({
  id: z.string(),
  merchant_id: z.string(),
  activity_type: z.string(),
  direction: z.string().nullable(),
  channel: z.string().nullable(),
  subject: z.string().nullable(),
  body: z.string().nullable(),
  detail: z.record(z.string(), z.unknown()).nullable(),
  occurred_at: z.string(),
  logged_by_id: z.string().nullable(),
  logged_by: activityLoggedBySchema.nullable(),
  created_at: z.string(),
});

export const merchantActivitiesSchema = z.array(
  merchantActivitySchema
);