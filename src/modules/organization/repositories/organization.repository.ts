import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { CreateOrganizationInput } from "../validators/organization.schema";

export const organizationRepository = {
  createWithAdmin: async (data: CreateOrganizationInput) => {
    const passwordHash = await bcrypt.hash(data.adminPassword, 10);

    return prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          email: data.email,
          cnpj: data.cnpj,
          phone: data.phone,
        },
      });

      const admin = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          passwordHash,
          role: "ADMIN",
          organizationId: organization.id,
        },
      });

      return { organization, admin: { id: admin.id, name: admin.name, email: admin.email } };
    });
  },

  findById: (id: string) => prisma.organization.findUnique({ where: { id } }),
  findAll: () => prisma.organization.findMany(),
  updateStatus: (id: string, status: "ACTIVE" | "BLOCKED" | "TRIAL") =>
    prisma.organization.update({ where: { id }, data: { status } }),

findAllWithStats: () =>
  prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { events: true, users: true } } },
  }),

updatePlan: (id: string, plan: string) =>
  prisma.organization.update({ where: { id }, data: { plan } }),

};