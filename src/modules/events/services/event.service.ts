import { eventRepository } from "../repositories/event.repository";
import { CreateEventInput } from "../validators/event.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";

export const eventService = {
  create: async (ctx: TenantContext, data: CreateEventInput) => {
    assertRole(ctx, ["ADMIN"]);

    // O primeiro evento da organização já nasce em operação; os demais ficam inativos
    const activeCount = await eventRepository.countActive(ctx.organizationId);
    return eventRepository.create(ctx.organizationId, { ...data, active: activeCount === 0 });
  },

  listAll: async (ctx: TenantContext) => {
    return eventRepository.findAllByOrg(ctx.organizationId);
  },

  getById: async (ctx: TenantContext, id: string) => {
    const event = await eventRepository.findById(id, ctx.organizationId);
    if (!event) throw new Error("NOT_FOUND");
    return event;
  },

  setActive: async (ctx: TenantContext, id: string, active: boolean) => {
    assertRole(ctx, ["ADMIN"]);
    const event = await eventRepository.setActive(id, ctx.organizationId, active);
    if (!event) throw new Error("NOT_FOUND");
    return event;
  },

  // Garante que o evento pertence à organização E está em operação
  assertActive: async (ctx: TenantContext, eventId: string) => {
    const event = await eventRepository.findById(eventId, ctx.organizationId);
    if (!event) throw new Error("NOT_FOUND");
    if (!event.active) throw new Error("EVENT_NOT_ACTIVE");
    return event;
  },
};