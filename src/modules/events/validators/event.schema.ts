import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(2),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateEventStatusSchema = z.object({
  active: z.boolean(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;