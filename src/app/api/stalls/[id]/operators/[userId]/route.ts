import { NextRequest, NextResponse } from "next/server";
import { stallOperatorService } from "@/modules/stalls/services/stall-operator.service";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id, userId } = await params;
    const result = await stallOperatorService.unassign(ctx, id, userId);
    return NextResponse.json(result);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}