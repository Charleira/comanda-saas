import { prisma } from "@/lib/prisma";
import { CreateStallInput } from "../validators/stall.schema";

export const stallRepository = {
  create: (organizationId: string, data: CreateStallInput) =>
    prisma.stall.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        eventId: data.eventId,
        organizationId,
      },
    }),

  findAllByEvent: (organizationId: string, eventId: string) =>
    prisma.stall.findMany({
      where: { eventId, organizationId },
      orderBy: { name: "asc" },
    }),

  findById: (id: string, organizationId: string) =>
    prisma.stall.findFirst({ where: { id, organizationId } }),
};