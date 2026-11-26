import { NextRequest, NextResponse } from "next/server";
import { dashboardService } from "@/modules/dashboard/services/dashboard.service";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId é obrigatório" }, { status: 400 });

    const overview = await dashboardService.getOverview(ctx, eventId);
    return NextResponse.json(overview);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}