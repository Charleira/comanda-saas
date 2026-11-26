import { organizationRepository } from "../repositories/organization.repository";
import { CreateOrganizationInput } from "../validators/organization.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";

export const organizationService = {
  create: async (data: CreateOrganizationInput) => {
  return organizationRepository.createWithAdmin(data);
},

  getById: async (ctx: TenantContext, id: string) => {
    if (ctx.role !== "SUPER_ADMIN" && ctx.organizationId !== id) {
      throw new Error("FORBIDDEN");
    }
    return organizationRepository.findById(id);
  },

  listAll: async (ctx: TenantContext) => {
  assertRole(ctx, []); // só SUPER_ADMIN
  return organizationRepository.findAllWithStats();
},

updateStatus: async (ctx: TenantContext, id: string, status: "ACTIVE" | "BLOCKED" | "TRIAL") => {
  assertRole(ctx, []);
  return organizationRepository.updateStatus(id, status);
},

updatePlan: async (ctx: TenantContext, id: string, plan: string) => {
  assertRole(ctx, []);
  return organizationRepository.updatePlan(id, plan);
},
  
};
