import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/modules/categories/services/category.service";
import { updateCategorySchema } from "@/modules/categories/validators/category.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getTenantContext();
    const { id } = await params;
    const category = await categoryService.getById(ctx, id);
    return NextResponse.json(category);
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
    const parsed = updateCategorySchema.parse(body);
    const result = await categoryService.update(ctx, id, parsed);
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
    const result = await categoryService.delete(ctx, id);
    return NextResponse.json(result);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}