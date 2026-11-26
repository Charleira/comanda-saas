import { NextRequest, NextResponse } from "next/server";
import { cardService } from "@/modules/cards/services/card.service";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const result = await cardService.unlink(ctx, id);
    return NextResponse.json(result);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}