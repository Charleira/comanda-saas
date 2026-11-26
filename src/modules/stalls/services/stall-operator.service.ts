import { stallOperatorRepository } from "../repositories/stall-operator.repository";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { userRepository } from "@/modules/users/repositories/user.repository";

export const stallOperatorService = {
  assign: async (ctx: TenantContext, stallId: string, userId: string) => {
    assertRole(ctx, ["ADMIN"]);

    // Só permite atribuir usuários que são OPERATOR (ou CASHIER, se fizer sentido no seu fluxo)
    const user = await userRepository.findById(userId, ctx.organizationId);
    if (!user) throw new Error("NOT_FOUND");
    if (user.role !== "OPERATOR") throw new Error("USER_MUST_BE_OPERATOR");

    const existing = await stallOperatorRepository.isAssigned(ctx.organizationId, stallId, userId);
    if (existing) throw new Error("ALREADY_ASSIGNED");

    return stallOperatorRepository.assign(ctx.organizationId, stallId, userId);
  },

  unassign: async (ctx: TenantContext, stallId: string, userId: string) => {
    assertRole(ctx, ["ADMIN"]);
    const result = await stallOperatorRepository.unassign(ctx.organizationId, stallId, userId);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return result;
  },

  listByStall: async (ctx: TenantContext, stallId: string) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);
    return stallOperatorRepository.listByStall(ctx.organizationId, stallId);
  },

  // Usado pelo próprio operador para saber em quais barracas ele pode vender
  listMyStalls: async (ctx: TenantContext) => {
    const assignments = await stallOperatorRepository.listStallsByOperator(ctx.organizationId, ctx.userId);
    return assignments.map((a) => a.stall);
  },

  assertOperatorCanSellAt: async (ctx: TenantContext, stallId: string) => {
    if (ctx.role !== "OPERATOR") return; // ADMIN e CASHIER não têm essa restrição
    const assigned = await stallOperatorRepository.isAssigned(ctx.organizationId, stallId, ctx.userId);
    if (!assigned) throw new Error("OPERATOR_NOT_ASSIGNED_TO_STALL");
  },
};