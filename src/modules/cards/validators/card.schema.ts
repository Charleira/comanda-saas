import { z } from "zod";

export const createCardSchema = z.object({
  eventId: z.string(),
  nfcId: z.string().min(3),
  customerId: z.string().optional(),
});

export const replaceCardSchema = z.object({
  oldCardId: z.string(),
  newNfcId: z.string().min(3),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type ReplaceCardInput = z.infer<typeof replaceCardSchema>;