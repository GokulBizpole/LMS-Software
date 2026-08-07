import prisma from "../config/db";

interface AuditLogPayload {
  adminId?: string;
  action: string;
  tableName: string;
  recordId: string;
  ipAddress?: string;
}

export const createAuditLog = async ({
  adminId,
  action,
  tableName,
  recordId,
  ipAddress,
}: AuditLogPayload) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        tableName,
        recordId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
};