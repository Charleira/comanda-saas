import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/modules/users/services/user.service";
import { updateUserSchema } from "@/modules/users/validators/user.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const user = await userService.getById(ctx, id);
    return NextResponse.json(user);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateUserSchema.parse(body);
    const result = await userService.update(ctx, id, parsed);
    return NextResponse.json(result);
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const result = await userService.delete(ctx, id);
    return NextResponse.json(result);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}