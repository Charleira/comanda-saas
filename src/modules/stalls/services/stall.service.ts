import { stallRepository } from "../repositories/stall.repository";
import { CreateStallInput } from "../validators/stall.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { eventService } from "@/modules/events/services/event.service";

export const stallService = {
  create: async (ctx: TenantContext, data: CreateStallInput) => {
    assertRole(ctx, ["ADMIN"]);
    // Só exige que o evento seja da organização: dá para montar barracas antes de colocar o evento em operação
    await eventService.getById(ctx, data.eventId);
    return stallRepository.create(ctx.organizationId, data);
  },

  listByEvent: async (ctx: TenantContext, eventId: string) => {
    return stallRepository.findAllByEvent(ctx.organizationId, eventId);
  },

  getById: async (ctx: TenantContext, id: string) => {
    const stall = await stallRepository.findById(id, ctx.organizationId);
    if (!stall) throw new Error("NOT_FOUND");
    return stall;
  },
};