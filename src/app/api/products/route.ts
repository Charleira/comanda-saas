import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/modules/products/services/product.service";
import { createProductSchema } from "@/modules/products/validators/product.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const stallId = req.nextUrl.searchParams.get("stallId");
    if (!stallId) return NextResponse.json({ error: "stallId é obrigatório" }, { status: 400 });

    const products = await productService.listByStall(ctx, stallId);
    return NextResponse.json(products);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createProductSchema.parse(body);
    const product = await productService.create(ctx, parsed);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}