import { prisma } from "@/lib/prisma";
import { CreateEventInput } from "../validators/event.schema";

export const eventRepository = {
  create: (organizationId: string, data: CreateEventInput & { active: boolean }) =>
    prisma.event.create({
      data: { ...data, organizationId },
    }),

  findAllByOrg: (organizationId: string) =>
    prisma.event.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),

  findById: (id: string, organizationId: string) =>
    prisma.event.findFirst({ where: { id, organizationId } }),

  countActive: (organizationId: string) =>
    prisma.event.count({ where: { organizationId, active: true } }),

  update: (id: string, organizationId: string, data: Partial<CreateEventInput>) =>
    prisma.event.updateMany({ where: { id, organizationId }, data }),

  // Ao ativar um evento, todos os outros da organização são desativados (só um em operação por vez)
  setActive: (id: string, organizationId: string, active: boolean) =>
    prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({ where: { id, organizationId } });
      if (!event) return null;

      if (active) {
        await tx.event.updateMany({
          where: { organizationId, active: true, NOT: { id } },
          data: { active: false },
        });
      }

      return tx.event.update({ where: { id }, data: { active } });
    }),
};