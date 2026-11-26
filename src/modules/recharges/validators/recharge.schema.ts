import { z } from "zod";

export const createRechargeSchema = z.object({
  cardId: z.string(),
  value: z.coerce.number().positive(),
});

export type CreateRechargeInput = z.infer<typeof createRechargeSchema>;