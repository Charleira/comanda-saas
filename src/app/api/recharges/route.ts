import { NextRequest, NextResponse } from "next/server";
import { rechargeService } from "@/modules/recharges/services/recharge.service";
import { createRechargeSchema } from "@/modules/recharges/validators/recharge.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId é obrigatório" }, { status: 400 });

    const recharges = await rechargeService.listByEvent(ctx, eventId);
    return NextResponse.json(recharges);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createRechargeSchema.parse(body);
    const result = await rechargeService.create(ctx, parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}