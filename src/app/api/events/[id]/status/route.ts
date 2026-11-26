import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/modules/events/services/event.service";
import { updateEventStatusSchema } from "@/modules/events/validators/event.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateEventStatusSchema.parse(body);
    const event = await eventService.setActive(ctx, id, parsed.active);
    return NextResponse.json(event);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}