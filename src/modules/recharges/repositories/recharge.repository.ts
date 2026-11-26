import { prisma } from "@/lib/prisma";

export const rechargeRepository = {
  findAllByEvent: (organizationId: string, eventId: string) =>
    prisma.recharge.findMany({
      where: { eventId, organizationId },
      orderBy: { createdAt: "desc" },
      include: { card: true, customer: true },
    }),
};