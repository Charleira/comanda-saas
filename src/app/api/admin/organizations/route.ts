import { NextRequest, NextResponse } from "next/server";
import { organizationService } from "@/modules/organization/services/organization.service";
import { createOrganizationSchema } from "@/modules/organization/validators/organization.schema";
import { getTenantContext, assertRole } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const orgs = await organizationService.listAll(ctx);
    return NextResponse.json(orgs);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

// Criação feita PELO Super Admin (autenticado) — diferente do POST público de self-signup
export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    assertRole(ctx, []); // só SUPER_ADMIN
    const body = await req.json();
    const parsed = createOrganizationSchema.parse(body);
    const org = await organizationService.create(parsed);
    return NextResponse.json(org, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}