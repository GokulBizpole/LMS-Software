import bcrypt from "bcrypt";
import prisma from "./src/config/db";

async function main() {
  const email = "qa-temp-admin@example.com";
  const password = "TempQaPass123!";
  const hash = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    await prisma.admin.delete({ where: { email } });
  }

  const admin = await prisma.admin.create({
    data: {
      name: "QA Temp Admin",
      email,
      password: hash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(JSON.stringify({ id: admin.id, email, password }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
