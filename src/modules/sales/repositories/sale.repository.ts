import { prisma } from "@/lib/prisma";

export const saleRepository = {
  findAllByEvent: (organizationId: string, eventId: string) =>
    prisma.sale.findMany({
      where: { eventId, organizationId },
      orderBy: { createdAt: "desc" },
      include: { product: true, stall: true, card: true },
    }),

  findById: (id: string, organizationId: string) =>
    prisma.sale.findFirst({ where: { id, organizationId } }),
};