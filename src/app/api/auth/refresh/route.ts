import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAccessToken, rotateRefreshToken } from "@/lib/tokens";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "refreshToken é obrigatório" }, { status: 400 });
    }

    const result = await rotateRefreshToken(refreshToken);
    if (!result) {
      return NextResponse.json({ error: "REFRESH_TOKEN_INVALID" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: result.userId } });
    if (!user) {
      return NextResponse.json({ error: "REFRESH_TOKEN_INVALID" }, { status: 401 });
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    return NextResponse.json({
      accessToken,
      refreshToken: result.newRefreshToken,
    });
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}