import { prisma } from "@/lib/prisma";
import { cardRepository } from "../repositories/card.repository";
import { CreateCardInput, ReplaceCardInput } from "../validators/card.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { eventService } from "@/modules/events/services/event.service";

export const cardService = {
  create: async (ctx: TenantContext, data: CreateCardInput) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);
    await eventService.assertActive(ctx, data.eventId);

    const existing = await cardRepository.findByNfcId(ctx.organizationId, data.nfcId);

    if (!existing) {
      return cardRepository.create(ctx.organizationId, data);
    }

    // Cartão inativo (foi desvinculado antes): reativa no evento atual, com saldo zerado
    if (!existing.active) {
      return prisma.card.update({
        where: { id: existing.id },
        data: {
          active: true,
          balance: 0,
          eventId: data.eventId,
          customerId: data.customerId ?? null,
        },
      });
    }

    // A partir daqui o cartão já está ativo
    if (existing.eventId !== data.eventId) throw new Error("CARD_ACTIVE_IN_ANOTHER_EVENT");
    if (existing.customerId) throw new Error("NFC_ALREADY_LINKED_TO_ANOTHER_CUSTOMER");

    // Ativo e livre: só vincula se foi pedido um cliente; senão, já estava ativado
    if (!data.customerId) throw new Error("CARD_ALREADY_ACTIVE");

    return prisma.card.update({
      where: { id: existing.id },
      data: { customerId: data.customerId },
    });
  },

  getBalance: async (ctx: TenantContext, nfcId: string) => {
    const card = await cardRepository.findByNfcId(ctx.organizationId, nfcId);
    if (!card || !card.active) throw new Error("NOT_FOUND");
    return { cardId: card.id, balance: card.balance };
  },

  replace: async (ctx: TenantContext, data: ReplaceCardInput) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);

    return prisma.$transaction(async (tx) => {
      const oldCard = await tx.card.findFirst({
        where: { id: data.oldCardId, organizationId: ctx.organizationId },
      });
      if (!oldCard) throw new Error("NOT_FOUND");

      await tx.card.update({ where: { id: oldCard.id }, data: { active: false, balance: 0 } });

      const newCard = await tx.card.create({
        data: {
          nfcId: data.newNfcId,
          balance: oldCard.balance,
          eventId: oldCard.eventId,
          customerId: oldCard.customerId,
          organizationId: ctx.organizationId,
        },
      });

      await tx.financialMovement.create({
        data: {
          type: "CARD_REPLACEMENT",
          value: oldCard.balance,
          organizationId: ctx.organizationId,
          eventId: oldCard.eventId,
          cardId: newCard.id,
          referenceId: oldCard.id,
        },
      });

      return newCard;
    });
  },

  unlink: async (ctx: TenantContext, cardId: string) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);

    const card = await cardRepository.findById(cardId, ctx.organizationId);
    if (!card) throw new Error("NOT_FOUND");

    return prisma.$transaction(async (tx) => {
      const updatedCard = await tx.card.update({
        where: { id: card.id },
        data: { customerId: null, active: false, balance: 0 },
      });

      if (Number(card.balance) > 0) {
        await tx.financialMovement.create({
          data: {
            type: "REFUND",
            value: card.balance,
            organizationId: ctx.organizationId,
            eventId: card.eventId,
            cardId: card.id,
            referenceId: card.id,
          },
        });
      }

      return updatedCard;
    });
  },
};