import { NextResponse } from "next/server";
import { stallOperatorService } from "@/modules/stalls/services/stall-operator.service";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const stalls = await stallOperatorService.listMyStalls(ctx);
    return NextResponse.json(stalls);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}