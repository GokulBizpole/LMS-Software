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

interface GetAuditLogsFilters {
  action?: string;
  tableName?: string;
  adminId?: string;
}

export const getAuditLogsService = async (
  page = 1,
  limit = 10,
  filters: GetAuditLogsFilters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.tableName ? { tableName: filters.tableName } : {}),
    ...(filters.adminId ? { adminId: filters.adminId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    }),

    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};