import { NextRequest, NextResponse } from "next/server";
import { stallOperatorService } from "@/modules/stalls/services/stall-operator.service";
import { assignOperatorSchema } from "@/modules/stalls/validators/stall-operator.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const operators = await stallOperatorService.listByStall(ctx, id);
    return NextResponse.json(operators);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const body = await req.json();
    const parsed = assignOperatorSchema.parse(body);
    const result = await stallOperatorService.assign(ctx, id, parsed.userId);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}