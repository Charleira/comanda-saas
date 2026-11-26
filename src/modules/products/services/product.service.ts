import { productRepository } from "../repositories/product.repository";
import { CreateProductInput } from "../validators/product.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { stallRepository } from "@/modules/stalls/repositories/stall.repository";
import { categoryRepository } from "@/modules/categories/repositories/category.repository";
import { stallOperatorService } from "@/modules/stalls/services/stall-operator.service";

export const productService = {
  create: async (ctx: TenantContext, data: CreateProductInput) => {
    assertRole(ctx, ["ADMIN"]);

    const stall = await stallRepository.findById(data.stallId, ctx.organizationId);
    if (!stall) throw new Error("STALL_NOT_FOUND");

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId, ctx.organizationId);
      if (!category) throw new Error("NOT_FOUND");
    }

    return productRepository.create(ctx.organizationId, data);
  },

  listByStall: async (ctx: TenantContext, stallId: string) => {
    // Operador só enxerga os produtos da barraca vinculada a ele (admin e caixa não têm essa restrição)
    await stallOperatorService.assertOperatorCanSellAt(ctx, stallId);
    return productRepository.findAllByStall(ctx.organizationId, stallId);
  },

  updatePrice: async (ctx: TenantContext, id: string, price: number) => {
    assertRole(ctx, ["ADMIN"]);
    const result = await productRepository.updatePrice(id, ctx.organizationId, price);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return result;
  },
};