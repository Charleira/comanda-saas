import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/modules/users/services/user.service";
import { createUserSchema } from "@/modules/users/validators/user.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const users = await userService.listAll(ctx);
    return NextResponse.json(users);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createUserSchema.parse(body);
    const user = await userService.create(ctx, parsed);
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}