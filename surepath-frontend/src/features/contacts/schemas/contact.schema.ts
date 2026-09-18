import { z } from "zod";

export const contactOwnerSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string().nullable(),
});

export const merchantContactSchema = z.object({
  id: z.string(),
  merchant_id: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  is_primary: z.boolean(),
  owner_id: z.string().nullable(),
  owner: contactOwnerSchema.nullable(),
  source: z.string().nullable(),
  confidence: z.string().nullable(),
  verified_at: z.string().nullable(),
  is_manual_override: z.boolean(),
  created_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const merchantContactsSchema = z.array(
  merchantContactSchema
);