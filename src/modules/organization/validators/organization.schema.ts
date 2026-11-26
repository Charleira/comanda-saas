import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});
export const updateOrgStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED", "TRIAL"]),
});

export const updateOrgPlanSchema = z.object({
  plan: z.string().min(2),
});

export type UpdateOrgStatusInput = z.infer<typeof updateOrgStatusSchema>;
export type UpdateOrgPlanInput = z.infer<typeof updateOrgPlanSchema>;

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;