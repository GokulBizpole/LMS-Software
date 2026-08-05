import jwt from "jsonwebtoken";

export const generateToken = (adminId: string, role: string) => {
  return jwt.sign(
    {
      id: adminId,
      role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};