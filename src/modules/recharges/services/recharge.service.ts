import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { CreateRechargeInput } from "../validators/recharge.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { rechargeRepository } from "../repositories/recharge.repository";

export const rechargeService = {
  create: async (ctx: TenantContext, data: CreateRechargeInput) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);

    const value = new Decimal(data.value).toFixed(2);

    return prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { id: data.cardId, organizationId: ctx.organizationId, active: true },
      });
      if (!card) throw new Error("CARD_NOT_FOUND");

      const event = await tx.event.findFirst({
        where: { id: card.eventId, organizationId: ctx.organizationId, active: true },
        select: { id: true },
      });
      if (!event) throw new Error("EVENT_NOT_ACTIVE");

      const updatedCard = await tx.card.update({
        where: { id: card.id },
        data: { balance: { increment: value } },
      });

      const recharge = await tx.recharge.create({
        data: {
          value,
          eventId: card.eventId,
          cardId: card.id,
          customerId: card.customerId,
          cashierId: ctx.userId,
          organizationId: ctx.organizationId,
        },
      });

      await tx.financialMovement.create({
        data: {
          type: "RECHARGE",
          value,
          organizationId: ctx.organizationId,
          eventId: card.eventId,
          cardId: card.id,
          referenceId: recharge.id,
        },
      });

      return { recharge, newBalance: updatedCard.balance };
    });
  },

  listByEvent: async (ctx: TenantContext, eventId: string) => {
    return rechargeRepository.findAllByEvent(ctx.organizationId, eventId);
  },
};