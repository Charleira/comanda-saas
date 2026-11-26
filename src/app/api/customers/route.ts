import { NextRequest, NextResponse } from "next/server";
import { customerService } from "@/modules/customers/services/customer.service";
import { createCustomerSchema } from "@/modules/customers/validators/customer.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const eventId = req.nextUrl.searchParams.get("eventId");
    const q = req.nextUrl.searchParams.get("q");
    if (!eventId) return NextResponse.json({ error: "eventId é obrigatório" }, { status: 400 });

    const customers = q
      ? await customerService.search(ctx, eventId, q)
      : await customerService.listByEvent(ctx, eventId);

    return NextResponse.json(customers);
  } catch (err: any) {
    const { body, status } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const parsed = createCustomerSchema.parse(body);
    const customer = await customerService.create(ctx, parsed);
    return NextResponse.json(customer, { status: 201 });
  } catch (err: any) {
    const { body: errBody, status } = handleApiError(err);
    return NextResponse.json(errBody, { status });
  }
}