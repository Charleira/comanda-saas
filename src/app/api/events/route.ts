import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/modules/events/services/event.service";
import { createEventSchema } from "@/modules/events/validators/event.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const events = await eventService.listAll(ctx);
    return NextResponse.json(events);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createEventSchema.parse(body);
    const event = await eventService.create(ctx, parsed);
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}