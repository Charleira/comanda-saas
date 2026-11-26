import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL ?? "admin@plataforma.com";
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "troque-esta-senha-123";

  const existing = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (existing) {
    console.log("Super Admin já existe:", existing.email);
    return;
  }

  // Organização "guarda-chuva" que abriga o(s) usuário(s) da plataforma
  const platformOrg = await prisma.organization.upsert({
    where: { id: "platform-org" },
    update: {},
    create: {
      id: "platform-org",
      name: "Plataforma",
      email: "plataforma@sistema.com",
      status: "ACTIVE",
      plan: "platform",
    },
  });

  const passwordHash = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      organizationId: platformOrg.id,
    },
  });

  console.log("✅ Super Admin criado:");
  console.log("   Email:", superAdmin.email);
  console.log("   Senha:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());