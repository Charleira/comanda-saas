import { NextRequest, NextResponse } from "next/server";
import { revokeRefreshToken } from "@/lib/tokens";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    return NextResponse.json({ loggedOut: true });
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}