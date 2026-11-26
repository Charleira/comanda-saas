import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/modules/categories/services/category.service";
import { createCategorySchema } from "@/modules/categories/validators/category.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const categories = await categoryService.listAll(ctx);
    return NextResponse.json(categories);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createCategorySchema.parse(body);
    const category = await categoryService.create(ctx, parsed);
    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}