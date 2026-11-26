import { customerRepository } from "../repositories/customer.repository";
import { CreateCustomerInput } from "../validators/customer.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { eventService } from "@/modules/events/services/event.service";

export const customerService = {
  create: async (ctx: TenantContext, data: CreateCustomerInput) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);
    await eventService.getById(ctx, data.eventId);
    return customerRepository.create(ctx.organizationId, data);
  },

  listByEvent: async (ctx: TenantContext, eventId: string) => {
    return customerRepository.findAllByEvent(ctx.organizationId, eventId);
  },

  search: async (ctx: TenantContext, eventId: string, query: string) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);
    return customerRepository.search(ctx.organizationId, eventId, query);
  },

  getById: async (ctx: TenantContext, id: string) => {
    const customer = await customerRepository.findById(id, ctx.organizationId);
    if (!customer) throw new Error("NOT_FOUND");
    return customer;
  },
};