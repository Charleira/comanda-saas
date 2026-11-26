import { NextRequest, NextResponse } from "next/server";
import { cardService } from "@/modules/cards/services/card.service";
import { createCardSchema } from "@/modules/cards/validators/card.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const nfcId = req.nextUrl.searchParams.get("nfcId");
    if (!nfcId) return NextResponse.json({ error: "nfcId é obrigatório" }, { status: 400 });

    const balance = await cardService.getBalance(ctx, nfcId);
    return NextResponse.json(balance);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createCardSchema.parse(body);
    const card = await cardService.create(ctx, parsed);
    return NextResponse.json(card, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}