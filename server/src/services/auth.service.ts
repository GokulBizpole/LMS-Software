import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../config/db";
import { env } from "../config/env";

interface LoginPayload {
  email: string;
  password: string;
}
interface PartnerRegisterPayload {
  partnerCode: string;
  name: string;
  phone: string;
  email?: string;
  password: string;
  address?: string;
  investmentAmount: number;
  currentBalance: number;
}

interface ChangePasswordPayload {
  adminId: string;
  currentPassword: string;
  newPassword: string;
}

            
export const adminLoginService = async ({ email, password }: LoginPayload) => {
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) throw new Error("Invalid email or password");
  if (!admin.isActive) throw new Error("Account is inactive. Contact super admin");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: admin.id, role: admin.role, type: "ADMIN" },
    env.JWT_SECRET as string,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
  );

  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  };
};

export const partnerLoginService = async ({ email, password }: LoginPayload) => {
  const partner = await prisma.partner.findUnique({ where: { email } });

  if (!partner || !partner.password) throw new Error("Invalid email or password");
  if (partner.status !== "ACTIVE") throw new Error("Account is inactive. Contact admin");

  const isMatch = await bcrypt.compare(password, partner.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: partner.id, type: "PARTNER" },
    env.JWT_SECRET as string,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
  );

  return {
    token,
    partner: { id: partner.id, name: partner.name, email: partner.email, partnerCode: partner.partnerCode },
  };
};

export const changePasswordService = async ({
  adminId,
  currentPassword,
  newPassword,
}: ChangePasswordPayload) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, admin.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.admin.update({
    where: {
      id: adminId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully",
  };
};