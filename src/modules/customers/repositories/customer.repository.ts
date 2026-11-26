import { prisma } from "@/lib/prisma";
import { CreateCustomerInput } from "../validators/customer.schema";

export const customerRepository = {
  create: (organizationId: string, data: CreateCustomerInput) =>
    prisma.customer.create({ data: { ...data, organizationId } }),

  findAllByEvent: (organizationId: string, eventId: string) =>
    prisma.customer.findMany({ where: { eventId, organizationId }, orderBy: { name: "asc" } }),

  findById: (id: string, organizationId: string) =>
    prisma.customer.findFirst({ where: { id, organizationId } }),

  search: (organizationId: string, eventId: string, query: string) =>
    prisma.customer.findMany({
      where: {
        organizationId,
        eventId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { cpf: { contains: query } },
        ],
      },
      take: 20,
    }),
};