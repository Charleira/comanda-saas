import { userRepository } from "../repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "../validators/user.schema";
import { TenantContext, assertRole } from "@/lib/tenant-context";
import { revokeAllUserTokens } from "@/lib/tokens";

export const userService = {
  create: async (ctx: TenantContext, data: CreateUserInput) => {
    assertRole(ctx, ["ADMIN"]);

    const existing = await userRepository.findByEmail(data.email, ctx.organizationId);
    if (existing) throw new Error("EMAIL_ALREADY_REGISTERED");

    return userRepository.create(ctx.organizationId, data);
  },

  listAll: async (ctx: TenantContext) => {
    assertRole(ctx, ["ADMIN"]);
    return userRepository.findAllByOrg(ctx.organizationId);
  },

  getById: async (ctx: TenantContext, id: string) => {
    assertRole(ctx, ["ADMIN"]);
    const user = await userRepository.findById(id, ctx.organizationId);
    if (!user) throw new Error("NOT_FOUND");
    return user;
  },

  update: async (ctx: TenantContext, id: string, data: UpdateUserInput) => {
    assertRole(ctx, ["ADMIN"]);

    // Impede que o admin remova a própria permissão de admin sem querer,
    // ficando sem ninguém para administrar a organização
    if (id === ctx.userId && data.role && data.role !== "ADMIN") {
      throw new Error("CANNOT_DOWNGRADE_SELF");
    }

    const result = await userRepository.update(id, ctx.organizationId, data);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return result;
  },

  delete: async (ctx: TenantContext, id: string) => {
  assertRole(ctx, ["ADMIN"]);
  if (id === ctx.userId) throw new Error("CANNOT_DELETE_SELF");

  const result = await userRepository.delete(id, ctx.organizationId);
  if (result.count === 0) throw new Error("NOT_FOUND");

  await revokeAllUserTokens(id);
  return result;
},
};