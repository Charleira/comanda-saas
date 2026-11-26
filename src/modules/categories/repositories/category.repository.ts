import { prisma } from "@/lib/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.schema";

export const categoryRepository = {
  create: (organizationId: string, data: CreateCategoryInput) =>
    prisma.category.create({ data: { ...data, organizationId } }),

  findAll: (organizationId: string) =>
    prisma.category.findMany({ where: { organizationId }, orderBy: { name: "asc" } }),

  findById: (id: string, organizationId: string) =>
    prisma.category.findFirst({ where: { id, organizationId } }),

  update: (id: string, organizationId: string, data: UpdateCategoryInput) =>
    prisma.category.updateMany({ where: { id, organizationId }, data }),

  delete: (id: string, organizationId: string) =>
    prisma.category.deleteMany({ where: { id, organizationId } }),

  countProducts: (id: string) =>
    prisma.product.count({ where: { categoryId: id } }),
};