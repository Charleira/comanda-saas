import { z } from "zod";

export const createCustomerSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;