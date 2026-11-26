import { NextRequest, NextResponse } from "next/server";
import { organizationService } from "@/modules/organization/services/organization.service";
import { updateOrgStatusSchema } from "@/modules/organization/validators/organization.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateOrgStatusSchema.parse(body);
    const org = await organizationService.updateStatus(ctx, id, parsed.status);
    return NextResponse.json(org);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}