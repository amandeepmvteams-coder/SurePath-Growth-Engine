import { z } from "zod";

export const merchantNoteSchema = z.object({
  id: z.string(),
  merchant_id: z.string(),
  author_id: z.string().nullable(),
  author: z.string().nullable(),
  body: z.string(),
  created_at: z.string(),
});

export const merchantNotesSchema = z.array(
  merchantNoteSchema
);