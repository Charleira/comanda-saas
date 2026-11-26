import { z } from "zod";

export const assignOperatorSchema = z.object({
  userId: z.string(),
});

export type AssignOperatorInput = z.infer<typeof assignOperatorSchema>;