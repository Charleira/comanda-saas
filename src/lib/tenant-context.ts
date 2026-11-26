import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export interface TenantContext {
  userId: string;
  organizationId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CASHIER" | "OPERATOR";
}

export async function getTenantContext(): Promise<TenantContext> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHENTICATED");
  }

  const token = authHeader.slice(7).trim();

  let decoded: { sub: string; organizationId: string; role: TenantContext["role"] };

  try {
    decoded = jwt.verify(token, process.env.AUTH_SECRET as string) as typeof decoded;
  } catch {
    throw new Error("UNAUTHENTICATED");
  }

  // Super Admin não é afetado por status de organização
  if (decoded.role !== "SUPER_ADMIN") {
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: { status: true },
    });

    if (!organization || organization.status === "BLOCKED") {
      throw new Error("ORGANIZATION_BLOCKED");
    }
  }

  return {
    userId: decoded.sub,
    organizationId: decoded.organizationId,
    role: decoded.role,
  };
}

export function assertRole(ctx: TenantContext, allowed: TenantContext["role"][]) {
  if (ctx.role === "SUPER_ADMIN") return;
  if (!allowed.includes(ctx.role)) {
    throw new Error("FORBIDDEN");
  }
}