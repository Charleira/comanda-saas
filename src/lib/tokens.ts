import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_DAYS = 30;

export interface TokenPayload {
  sub: string;
  organizationId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CASHIER" | "OPERATOR";
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.AUTH_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function rotateRefreshToken(oldToken: string): Promise<{
  newRefreshToken: string;
  userId: string;
} | null> {
  const existing = await prisma.refreshToken.findUnique({ where: { token: oldToken } });

  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    return null;
  }

  // Revoga o antigo (rotação — evita reuso do mesmo refresh token)
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revoked: true },
  });

  const newRefreshToken = await generateRefreshToken(existing.userId);

  return { newRefreshToken, userId: existing.userId };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}