import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { CreateSaleInput } from "../validators/sale.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { saleRepository } from "../repositories/sale.repository";
import { stallOperatorService } from "@/modules/stalls/services/stall-operator.service";

export const saleService = {
  create: async (ctx: TenantContext, data: CreateSaleInput) => {
    assertRole(ctx, ["ADMIN", "CASHIER", "OPERATOR"]);

    // Trava: operador só vende na(s) barraca(s) atribuída(s) a ele
    await stallOperatorService.assertOperatorCanSellAt(ctx, data.stallId);

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: data.productId, organizationId: ctx.organizationId, available: true },
      });
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const stall = await tx.stall.findFirst({
        where: { id: data.stallId, organizationId: ctx.organizationId, active: true },
      });
      if (!stall) throw new Error("STALL_NOT_FOUND");

      if (product.stallId !== stall.id) throw new Error("PRODUCT_NOT_IN_STALL");

      const card = await tx.card.findFirst({
        where: { id: data.cardId, organizationId: ctx.organizationId, active: true },
      });
      if (!card) throw new Error("CARD_NOT_FOUND");

      // Dados nunca são compartilhados entre eventos: cartão e barraca precisam ser do mesmo evento
      if (stall.eventId !== card.eventId) throw new Error("CARD_EVENT_MISMATCH");

      const event = await tx.event.findFirst({
        where: { id: card.eventId, organizationId: ctx.organizationId, active: true },
        select: { id: true },
      });
      if (!event) throw new Error("EVENT_NOT_ACTIVE");

      const total = new Decimal(product.price).mul(data.quantity).toFixed(2);

      // Débito atômico: só debita se ainda houver saldo suficiente no momento do UPDATE
      const debited = await tx.card.updateMany({
        where: {
          id: card.id,
          organizationId: ctx.organizationId,
          active: true,
          balance: { gte: total },
        },
        data: { balance: { decrement: total } },
      });
      if (debited.count === 0) throw new Error("INSUFFICIENT_BALANCE");

      const updatedCard = await tx.card.findUniqueOrThrow({
        where: { id: card.id },
        select: { balance: true },
      });

      const sale = await tx.sale.create({
        data: {
          quantity: data.quantity,
          unitPrice: product.price,
          total,
          eventId: card.eventId,
          stallId: stall.id,
          productId: product.id,
          customerId: card.customerId,
          cardId: card.id,
          operatorId: ctx.userId,
          organizationId: ctx.organizationId,
        },
      });

      await tx.financialMovement.create({
        data: {
          type: "SALE",
          value: total,
          organizationId: ctx.organizationId,
          eventId: card.eventId,
          cardId: card.id,
          referenceId: sale.id,
        },
      });

      return { sale, newBalance: updatedCard.balance };
    });
  },

  cancel: async (ctx: TenantContext, saleId: string) => {
    assertRole(ctx, ["ADMIN"]);

    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, organizationId: ctx.organizationId },
      });
      if (!sale) throw new Error("SALE_NOT_FOUND");

      // Só quem conseguir marcar como cancelada estorna o saldo (evita estorno duplicado)
      const marked = await tx.sale.updateMany({
        where: { id: sale.id, organizationId: ctx.organizationId, canceled: false },
        data: { canceled: true },
      });
      if (marked.count === 0) throw new Error("SALE_NOT_FOUND");

      await tx.card.update({
        where: { id: sale.cardId },
        data: { balance: { increment: sale.total } },
      });

      await tx.financialMovement.create({
        data: {
          type: "CANCELLATION",
          value: sale.total,
          organizationId: ctx.organizationId,
          eventId: sale.eventId,
          cardId: sale.cardId,
          referenceId: sale.id,
        },
      });

      return { canceled: true };
    });
  },

  listByEvent: async (ctx: TenantContext, eventId: string) => {
    assertRole(ctx, ["ADMIN", "CASHIER"]);
    return saleRepository.findAllByEvent(ctx.organizationId, eventId);
  },
};