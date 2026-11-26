"use server";

import { organizationService } from "../services/organization.service";
import { createOrganizationSchema } from "../validators/organization.schema";
import { getTenantContext } from "@/lib/tenant-context";
import { revalidatePath } from "next/cache";

export async function createOrganizationAction(formData: FormData) {
  const parsed = createOrganizationSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    cnpj: formData.get("cnpj") || undefined,
    phone: formData.get("phone") || undefined,
  });

  const org = await organizationService.create(parsed);
  revalidatePath("/dashboard");
  return org;
}

export async function listOrganizationsAction() {
  const ctx = await getTenantContext();
  return organizationService.listAll(ctx);
}