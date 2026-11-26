import { prisma } from "@/lib/prisma";
import { CreateProductInput } from "../validators/product.schema";

export const productRepository = {
  create: (organizationId: string, data: CreateProductInput) =>
    prisma.product.create({
      data: { ...data, organizationId },
    }),

  findAllByStall: (organizationId: string, stallId: string) =>
    prisma.product.findMany({
      where: { stallId, organizationId },
      orderBy: { order: "asc" },
    }),

  findById: (id: string, organizationId: string) =>
    prisma.product.findFirst({ where: { id, organizationId } }),

  updatePrice: (id: string, organizationId: string, price: number) =>
    prisma.product.updateMany({ where: { id, organizationId }, data: { price } }),
};