import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import { scheduleState } from "./payment.service";

// Who is acting on a group. Admins may view + create any group; partners may
// view/create/edit/delete only groups made of their own customers.
export interface GroupActor {
  type: "ADMIN" | "PARTNER";
  id: string;
}

interface GroupInput {
  name: string;
  groupHeadId: string;
  memberIds?: string[];
}

const customerSummarySelect = {
  id: true,
  customerCode: true,
  name: true,
  phone: true,
  city: true,
  status: true,
  partnerId: true,
} as const;

const groupListInclude = {
  groupHead: { select: customerSummarySelect },
  partner: { select: { id: true, name: true, partnerCode: true } },
  _count: { select: { members: true } },
} as const;

const groupDetailInclude = {
  groupHead: { select: customerSummarySelect },
  partner: { select: { id: true, name: true, partnerCode: true } },
  members: {
    orderBy: { createdAt: "asc" },
    include: {
      customer: {
        select: {
          ...customerSummarySelect,
          // Most recent loans per member: the first is shown as "Latest
          // loan"; the collectable (approved/active) one drives Collect —
          // it can be an older loan when a carry-over loan is pending.
          loans: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, loanNumber: true, status: true, principalAmount: true },
          },
        },
      },
    },
  },
  _count: { select: { members: true } },
} as const;

// Claims the next group code atomically (single upsert with increment), so
// concurrent creates never collide and codes are never reused.
const generateGroupCode = async (tx: Prisma.TransactionClient) => {
  const seq = await tx.codeSequence.upsert({
    where: { key: "GROUP" },
    create: { key: "GROUP", value: 1 },
    update: { value: { increment: 1 } },
  });

  return `GRP${String(seq.value).padStart(3, "0")}`;
};

// The DB is remote (~350ms per round trip), and every statement in an
// interactive transaction is a separate round trip. So transactions here do
// writes only — members go in one createMany instead of one INSERT each, and
// the detail view (several relation SELECTs) is loaded after commit. The
// explicit timeout is headroom for slow/cold connections, not the fix.
const TX_OPTIONS = { maxWait: 10000, timeout: 15000 };

const getActorName = async (actor: GroupActor) => {
  if (actor.type === "ADMIN") {
    const admin = await prisma.admin.findUnique({
      where: { id: actor.id },
      select: { name: true },
    });
    if (!admin) throw new Error("Admin not found");
    return admin.name;
  }

  const partner = await prisma.partner.findUnique({
    where: { id: actor.id },
    select: { name: true },
  });
  if (!partner) throw new Error("Partner not found");
  return partner.name;
};

// Validates name/head/members and returns the normalized member list plus
// the partner that owns them. Every member must be an ACTIVE customer, not
// already in another group, and all members must share one partner.
const validateGroupInput = async (
  data: GroupInput,
  actor: GroupActor,
  excludeGroupId?: string
) => {
  const name = data.name?.trim();
  if (!name) throw new Error("Group name is required");
  if (name.length > 100) throw new Error("Group name must be 100 characters or fewer");

  if (!data.groupHeadId) throw new Error("Group head is required");

  const memberIds = Array.from(
    new Set([data.groupHeadId, ...(Array.isArray(data.memberIds) ? data.memberIds : [])])
  );

  const customers = await prisma.customer.findMany({
    where: { id: { in: memberIds } },
    select: {
      ...customerSummarySelect,
      groupMembership: { select: { groupId: true, group: { select: { groupCode: true } } } },
    },
  });

  if (customers.length !== memberIds.length) {
    throw new Error("One or more selected customers were not found");
  }

  for (const c of customers) {
    if (actor.type === "PARTNER" && c.partnerId !== actor.id) {
      throw new Error("One or more selected customers were not found");
    }
    if (c.status !== "ACTIVE") {
      throw new Error(`${c.name} (${c.customerCode}) is not an active customer`);
    }
    if (c.groupMembership && c.groupMembership.groupId !== excludeGroupId) {
      throw new Error(
        `${c.name} (${c.customerCode}) already belongs to group ${c.groupMembership.group.groupCode}`
      );
    }
  }

  const partnerIds = new Set(customers.map((c) => c.partnerId ?? null));
  if (partnerIds.size > 1) {
    throw new Error("All group members must belong to the same partner");
  }

  const partnerId = customers[0]?.partnerId ?? null;

  return { name, memberIds, partnerId };
};

// Loans counted as "active" in group totals (approved and still running).
const OPEN_LOAN_STATUSES = ["APPROVED", "ACTIVE", "OVERDUE"] as const;

const scopeWhere = (actor: GroupActor): Prisma.GroupWhereInput =>
  actor.type === "PARTNER" ? { partnerId: actor.id } : {};

// ================= CREATE =================
export const createGroup = async (
  data: GroupInput,
  actor: GroupActor,
  ipAddress?: string
) => {
  const [{ name, memberIds, partnerId }, createdByName] = await Promise.all([
    validateGroupInput(data, actor),
    getActorName(actor),
  ]);

  // Code claim + group + members commit or roll back together.
  const { id } = await prisma.$transaction(async (tx) => {
    const groupCode = await generateGroupCode(tx);

    return tx.group.create({
      data: {
        groupCode,
        name,
        groupHeadId: data.groupHeadId,
        
        partnerId,
        createdByType: actor.type,
        createdById: actor.id,
        createdByName,
        members: {
          createMany: { data: memberIds.map((customerId) => ({ customerId })) },
        },
      },
      select: { id: true },
    });
  }, TX_OPTIONS);

  const [group] = await Promise.all([
    prisma.group.findUniqueOrThrow({ where: { id }, include: groupDetailInclude }),
    createAuditLog({
      adminId: actor.type === "ADMIN" ? actor.id : undefined,
      action: "CREATE",
      tableName: "GROUP",
      recordId: id,
      ipAddress,
    }),
  ]);

  return group;
};

// ================= LIST =================
export const getAllGroups = async (
  actor: GroupActor,
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order: "asc" | "desc" = "desc"
) => {
  const skip = (page - 1) * limit;
  const scope = scopeWhere(actor);

  const where: Prisma.GroupWhereInput = {
    ...scope,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { groupCode: { contains: search, mode: "insensitive" } },
            { groupHead: { name: { contains: search, mode: "insensitive" } } },
            { createdByName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const allowedSortFields = ["createdAt", "name", "groupCode"];
  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Week starts Monday, matching the payments "this week" filter.
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  // Loans/payments of customers who are members of a group in scope.
  const inScopedGroup: Prisma.CustomerWhereInput = { groupMembership: { is: { group: scope } } };

  const [groups, total, totalGroups, totalMembers, addedThisMonth, activeLoans, weekCollection] =
    await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [finalSortBy]: order },
        include: {
          ...groupListInclude,
          members: { select: { customerId: true } },
        },
      }),
      prisma.group.count({ where }),
      prisma.group.count({ where: scope }),
      prisma.groupMember.count({ where: { group: scope } }),
      prisma.group.count({ where: { ...scope, createdAt: { gte: monthStart } } }),
      prisma.loan.count({
        where: { status: { in: [...OPEN_LOAN_STATUSES] }, customer: inScopedGroup },
      }),
      prisma.payment.aggregate({
        where: { paidAt: { gte: weekStart }, loan: { customer: inScopedGroup } },
        _sum: { totalReceived: true },
      }),
    ]);

  // Per-group loan totals for this page only.
  const memberToGroup = new Map<string, string>();
  for (const g of groups) for (const m of g.members) memberToGroup.set(m.customerId, g.id);
  const memberIds = [...memberToGroup.keys()];

  const [openLoans, weekPayments] = memberIds.length
    ? await Promise.all([
        prisma.loan.findMany({
          where: { customerId: { in: memberIds }, status: { in: [...OPEN_LOAN_STATUSES] } },
          select: { customerId: true, principalAmount: true, balanceAmount: true },
        }),
        prisma.payment.findMany({
          where: { paidAt: { gte: weekStart }, loan: { customerId: { in: memberIds } } },
          select: { totalReceived: true, loan: { select: { customerId: true } } },
        }),
      ])
    : [[], []];

  const totals = new Map<string, { activeLoans: number; totalLoan: number; outstanding: number; weekCollected: number }>();
  const totalsFor = (groupId: string) => {
    if (!totals.has(groupId)) totals.set(groupId, { activeLoans: 0, totalLoan: 0, outstanding: 0, weekCollected: 0 });
    return totals.get(groupId)!;
  };
  for (const l of openLoans) {
    const t = totalsFor(memberToGroup.get(l.customerId)!);
    t.activeLoans += 1;
    t.totalLoan += Number(l.principalAmount);
    t.outstanding += Number(l.balanceAmount);
  }
  for (const p of weekPayments) {
    totalsFor(memberToGroup.get(p.loan.customerId)!).weekCollected += Number(p.totalReceived);
  }

  return {
    groups: groups.map(({ members: _members, ...g }) => ({
      ...g,
      loanStats: totals.get(g.id) ?? { activeLoans: 0, totalLoan: 0, outstanding: 0, weekCollected: 0 },
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalGroups,
      totalMembers,
      addedThisMonth,
      activeLoans,
      weekCollection: Number(weekCollection._sum.totalReceived ?? 0),
    },
  };
};

// ================= GET ONE =================
export const getGroupById = async (id: string, actor: GroupActor) => {
  const group = await prisma.group.findFirst({
    where: { id, ...scopeWhere(actor) },
    include: groupDetailInclude,
  });

  if (!group) throw new Error("Group not found");

  return group;
};

// ================= GROUP OVERVIEW (weekly collection status) =================
// Loan totals, today's collection and each member's status for the current
// week (Mon–Sun), derived from the loan schedules + payments with the same
// per-week logic the collection screen uses.
//   PAID     – this week's installment is covered and nothing is carried
//   DUE      – this week's installment is still pending
//   MISSED   – an earlier week is still unpaid (carried forward)
//   UPCOMING – running loan, but nothing falls due this week
//   NO_LOAN  – no approved/active loan
export const getGroupOverview = async (id: string, actor: GroupActor) => {
  const group = await prisma.group.findFirst({
    where: { id, ...scopeWhere(actor) },
    select: { members: { select: { customerId: true } } },
  });

  if (!group) throw new Error("Group not found");

  const memberIds = group.members.map((m) => m.customerId);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekStart = new Date(startOfToday);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const GIVEN_STATUSES = [...OPEN_LOAN_STATUSES, "CLOSED" as const];

  const [loans, collectedTillDate] = await Promise.all([
    prisma.loan.findMany({
      where: { customerId: { in: memberIds }, status: { in: GIVEN_STATUSES } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        loanNumber: true,
        status: true,
        customerId: true,
        principalAmount: true,
        balanceAmount: true,
        installmentAmount: true,
        schedules: {
          orderBy: { installmentNo: "asc" },
          select: {
            id: true,
            installmentNo: true,
            dueDate: true,
            amount: true,
            penalty: true,
            isPaid: true,
            paidDate: true,
            payments: { select: { amount: true, penalty: true, totalReceived: true, paidAt: true } },
          },
        },
      },
    }),
    prisma.payment.aggregate({
      where: { loan: { customerId: { in: memberIds } } },
      _sum: { totalReceived: true },
    }),
  ]);

  let totalLoanGiven = 0;
  let outstanding = 0;
  let collectedToday = 0;

  for (const l of loans) {
    totalLoanGiven += Number(l.principalAmount);
    if (l.status !== "CLOSED") outstanding += Number(l.balanceAmount);
    for (const s of l.schedules)
      for (const p of s.payments)
        if (p.paidAt && p.paidAt >= startOfToday) collectedToday += Number(p.totalReceived);
  }

  const r2 = (n: number) => Math.round(n * 100) / 100;

  const members = memberIds.map((customerId) => {
    // Newest running loan is the one being collected on.
    const loan = loans.find((l) => l.customerId === customerId && l.status !== "CLOSED");

    if (!loan) {
      return { customerId, loan: null, weekStatus: "NO_LOAN" as const, weekAmount: 0, dueNow: 0, carriedForward: 0, paidToday: 0 };
    }

    let carriedForward = 0;
    let thisWeekPending = 0;
    let hasThisWeek = false;
    let paidToday = 0;

    for (const s of loan.schedules) {
      const st = scheduleState(s);
      if (s.dueDate < weekStart) carriedForward += st.pending;
      else if (s.dueDate < weekEnd) {
        hasThisWeek = true;
        thisWeekPending += st.pending;
      }
      for (const p of s.payments)
        if (p.paidAt && p.paidAt >= startOfToday) paidToday += Number(p.totalReceived);
    }

    const weekStatus =
      carriedForward > 0 ? "MISSED" : !hasThisWeek ? "UPCOMING" : thisWeekPending > 0 ? "DUE" : "PAID";

    return {
      customerId,
      loan: {
        id: loan.id,
        loanNumber: loan.loanNumber,
        status: loan.status,
        installmentAmount: Number(loan.installmentAmount),
      },
      weekStatus: weekStatus as "PAID" | "DUE" | "MISSED" | "UPCOMING",
      weekAmount: Number(loan.installmentAmount),
      // What should be collected now: this week's pending + carried forward.
      dueNow: r2(carriedForward + thisWeekPending),
      carriedForward: r2(carriedForward),
      paidToday: r2(paidToday),
    };
  });

  // Members with an installment falling in (or carried into) this week.
  const dueThisWeek = members.filter(
    (m) => m.weekStatus === "PAID" || m.weekStatus === "DUE" || m.weekStatus === "MISSED"
  );

  return {
    stats: {
      totalMembers: memberIds.length,
      totalLoanGiven: r2(totalLoanGiven),
      outstanding: r2(outstanding),
      collectedTillDate: Number(collectedTillDate._sum.totalReceived ?? 0),
    },
    today: {
      date: startOfToday,
      collectedToday: r2(collectedToday),
      membersPaid: dueThisWeek.filter((m) => m.weekStatus === "PAID").length,
      membersDueThisWeek: dueThisWeek.length,
    },
    members,
  };
};

// ================= UPDATE (partner only) =================
export const updateGroupById = async (
  id: string,
  data: GroupInput,
  actor: GroupActor,
  ipAddress?: string
) => {
  if (actor.type !== "PARTNER") throw new Error("Only partners can edit groups");

  const [existing, { name, memberIds, partnerId }] = await Promise.all([
    prisma.group.findFirst({ where: { id, ...scopeWhere(actor) }, select: { id: true } }),
    validateGroupInput(data, actor, id),
  ]);
  if (!existing) throw new Error("Group not found");

  // Member replacement + group fields commit or roll back together.
  await prisma.$transaction(async (tx) => {
    await tx.groupMember.deleteMany({ where: { groupId: id } });

    await tx.group.update({
      where: { id },
      data: {
        name,
        groupHeadId: data.groupHeadId,
        partnerId,
        members: {
          createMany: { data: memberIds.map((customerId) => ({ customerId })) },
        },
      },
      select: { id: true },
    });
  }, TX_OPTIONS);

  const [group] = await Promise.all([
    prisma.group.findUniqueOrThrow({ where: { id }, include: groupDetailInclude }),
    createAuditLog({
      action: "UPDATE",
      tableName: "GROUP",
      recordId: id,
      ipAddress,
    }),
  ]);

  return group;
};

// ================= DELETE (partner only) =================
// Removes the group and its memberships only — the customers themselves are
// untouched.
export const deleteGroupById = async (
  id: string,
  actor: GroupActor,
  ipAddress?: string
) => {
  if (actor.type !== "PARTNER") throw new Error("Only partners can delete groups");

  const group = await getGroupById(id, actor);

  await prisma.group.delete({ where: { id } });

  await createAuditLog({
    action: "DELETE",
    tableName: "GROUP",
    recordId: group.id,
    ipAddress,
  });

  return { id: group.id };
};

// ================= ELIGIBLE CUSTOMERS =================
// ACTIVE customers (in the actor's scope) that are not in any group yet, plus
// the current members of `groupId` when editing. Admins can narrow to one
// partner's customers ("unassigned" = customers with no partner).
export const getEligibleCustomers = async (
  actor: GroupActor,
  search = "",
  groupId?: string,
  partnerFilter?: string,
  limit = 50
) => {
  const partnerWhere: Prisma.CustomerWhereInput =
    actor.type === "PARTNER"
      ? { partnerId: actor.id }
      : partnerFilter === "unassigned"
        ? { partnerId: null }
        : partnerFilter
          ? { partnerId: partnerFilter }
          : {};

  const customers = await prisma.customer.findMany({
    where: {
      status: "ACTIVE",
      ...partnerWhere,
      OR: [
        { groupMembership: { is: null } },
        ...(groupId ? [{ groupMembership: { is: { groupId } } }] : []),
      ],
      ...(search
        ? {
            AND: [
              {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search } },
                  { customerCode: { contains: search, mode: "insensitive" } },
                ],
              },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: Math.min(Math.max(limit, 1), 100),
    select: {
      ...customerSummarySelect,
      partner: { select: { id: true, name: true, partnerCode: true } },
    },
  });

  return customers;
};
