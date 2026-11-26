import { categoryRepository } from "../repositories/category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";

export const categoryService = {
  create: async (ctx: TenantContext, data: CreateCategoryInput) => {
    assertRole(ctx, ["ADMIN"]);
    return categoryRepository.create(ctx.organizationId, data);
  },

  listAll: async (ctx: TenantContext) => {
    return categoryRepository.findAll(ctx.organizationId);
  },

  getById: async (ctx: TenantContext, id: string) => {
    const category = await categoryRepository.findById(id, ctx.organizationId);
    if (!category) throw new Error("NOT_FOUND");
    return category;
  },

  update: async (ctx: TenantContext, id: string, data: UpdateCategoryInput) => {
    assertRole(ctx, ["ADMIN"]);
    const result = await categoryRepository.update(id, ctx.organizationId, data);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return result;
  },

  delete: async (ctx: TenantContext, id: string) => {
    assertRole(ctx, ["ADMIN"]);

    const productsCount = await categoryRepository.countProducts(id);
    if (productsCount > 0) throw new Error("CATEGORY_IN_USE");

    const result = await categoryRepository.delete(id, ctx.organizationId);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return result;
  },
};