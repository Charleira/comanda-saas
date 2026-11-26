import { z } from "zod";

export const createSaleSchema = z.object({
  cardId: z.string(),
  productId: z.string(),
  stallId: z.string(),
  quantity: z.coerce.number().int().positive().default(1),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;