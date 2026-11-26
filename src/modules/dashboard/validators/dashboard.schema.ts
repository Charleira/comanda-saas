import { z } from "zod";

export const dashboardQuerySchema = z.object({
  eventId: z.string(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;