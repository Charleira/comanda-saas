import { NextRequest, NextResponse } from "next/server";
import { saleService } from "@/modules/sales/services/sale.service";
import { createSaleSchema } from "@/modules/sales/validators/sale.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId é obrigatório" }, { status: 400 });

    const sales = await saleService.listByEvent(ctx, eventId);
    return NextResponse.json(sales);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createSaleSchema.parse(body);
    const result = await saleService.create(ctx, parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}