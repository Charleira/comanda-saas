import { z } from "zod";

export const createStallSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CreateStallInput = z.infer<typeof createStallSchema>;