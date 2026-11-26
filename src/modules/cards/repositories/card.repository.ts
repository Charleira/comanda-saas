import { prisma } from "@/lib/prisma";
import { CreateCardInput } from "../validators/card.schema";

export const cardRepository = {
  create: (organizationId: string, data: CreateCardInput) =>
    prisma.card.create({ data: { ...data, organizationId } }),

  findByNfcId: (organizationId: string, nfcId: string) =>
    prisma.card.findFirst({ where: { nfcId, organizationId } }),

  findById: (id: string, organizationId: string) =>
    prisma.card.findFirst({ where: { id, organizationId } }),

  deactivate: (id: string, organizationId: string) =>
    prisma.card.updateMany({ where: { id, organizationId }, data: { active: false } }),
};