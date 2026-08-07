import bcrypt from "bcrypt";
import prisma from "../config/db";

async function main() {
  const existing = await prisma.admin.findUnique({
    where: {
      email: "admin@gmail.com",
    },
  });

  if (existing) {
    console.log("✅ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.admin.create({
    data: {
      name: "Super Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin created successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });