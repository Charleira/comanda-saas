import { prisma } from "@/lib/prisma";
export const stallOperatorRepository = {
  assign: (organizationId: string, stallId: string, userId: string) =>
    prisma.stallOperator.create({ data: { organizationId, stallId, userId } }),

  unassign: (organizationId: string, stallId: string, userId: string) =>
    prisma.stallOperator.deleteMany({ where: { organizationId, stallId, userId } }),

  listByStall: (organizationId: string, stallId: string) =>
    prisma.stallOperator.findMany({
      where: { organizationId, stallId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),

  isAssigned: (organizationId: string, stallId: string, userId: string) =>
    prisma.stallOperator.findFirst({ where: { organizationId, stallId, userId } }),

  listStallsByOperator: (organizationId: string, userId: string) =>
    prisma.stallOperator.findMany({
      where: { organizationId, userId },
      include: { stall: true },
    }),
};