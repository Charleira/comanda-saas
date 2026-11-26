import { z } from "zod";

export const createProductSchema = z.object({
  stallId: z.string(),
  categoryId: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  order: z.coerce.number().default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;