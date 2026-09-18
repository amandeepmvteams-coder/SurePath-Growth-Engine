import { apiClient } from "@/lib/api/client";

import {
  merchantNoteSchema,
  merchantNotesSchema,
} from "../schemas/note.schema";

import type {
  CreateMerchantNoteData,
  MerchantNote,
} from "../types/note.types";

export async function getMerchantNotes(
  merchantId: string
): Promise<MerchantNote[]> {
  const response = await apiClient.get(
    `/api/v1/merchants/${merchantId}/notes`
  );

  return merchantNotesSchema.parse(response.data);
}

export async function createMerchantNote(
  merchantId: string,
  data: CreateMerchantNoteData
): Promise<MerchantNote> {
  const response = await apiClient.post(
    `/api/v1/merchants/${merchantId}/notes`,
    data
  );

  return merchantNoteSchema.parse(response.data);
}

export async function deleteMerchantNote(
  merchantId: string,
  noteId: string
): Promise<void> {
  await apiClient.delete(
    `/api/v1/merchants/${merchantId}/notes/${noteId}`
  );
}