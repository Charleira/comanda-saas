import { NextRequest, NextResponse } from "next/server";
import { stallService } from "@/modules/stalls/services/stall.service";
import { createStallSchema } from "@/modules/stalls/validators/stall.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId é obrigatório" }, { status: 400 });

    const stalls = await stallService.listByEvent(ctx, eventId);
    return NextResponse.json(stalls);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createStallSchema.parse(body);
    const stall = await stallService.create(ctx, parsed);
    return NextResponse.json(stall, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}