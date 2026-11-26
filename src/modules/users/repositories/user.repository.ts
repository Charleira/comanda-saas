import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { CreateUserInput, UpdateUserInput } from "../validators/user.schema";

export const userRepository = {
  create: async (organizationId: string, data: CreateUserInput) => {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        organizationId,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  findAllByOrg: (organizationId: string) =>
    prisma.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: "asc" },
    }),

  findById: (id: string, organizationId: string) =>
    prisma.user.findFirst({
      where: { id, organizationId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),

  findByEmail: (email: string, organizationId: string) =>
    prisma.user.findFirst({ where: { email, organizationId } }),

  update: (id: string, organizationId: string, data: UpdateUserInput) =>
    prisma.user.updateMany({ where: { id, organizationId }, data }),

  delete: (id: string, organizationId: string) =>
    prisma.user.deleteMany({ where: { id, organizationId } }),
};