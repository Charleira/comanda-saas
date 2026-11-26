import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { generateAccessToken, generateRefreshToken } from "@/lib/tokens";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const rateLimitKey = `login:${email.toLowerCase()}`;
    const { allowed, retryAfterSeconds } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Super Admin nunca é bloqueado por status de organização (ele não pertence a um tenant operacional)
    if (user.role !== "SUPER_ADMIN" && user.organization.status === "BLOCKED") {
      return NextResponse.json({ error: "ORGANIZATION_BLOCKED" }, { status: 403 });
    }

    resetRateLimit(rateLimitKey);

    const accessToken = generateAccessToken({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}