import prisma from "../config/db";

export const runPenaltyJob = async () => {
  console.log("Running Auto Penalty Job...");

  // Settings fetch
  const settings = await prisma.setting.findFirst();

  if (!settings) {
    console.log("Settings not found.");
    return;
  }

  const penaltyPercentage =
    Number(settings.defaultPenaltyPercentage);

  const today = new Date();

  // Find overdue unpaid installments
  const overdueSchedules = await prisma.loanSchedule.findMany({
    where: {
      isPaid: false,
      dueDate: {
        lt: today,
      },
    },
  });

  console.log(`Found ${overdueSchedules.length} overdue installments`);

  for (const schedule of overdueSchedules) {
    // Skip if penalty already added
    if (Number(schedule.penalty) > 0) continue;

    const penalty =
      (Number(schedule.amount) * penaltyPercentage) / 100;

    await prisma.loanSchedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        penalty,
      },
    });

    console.log(
      `Penalty added for Installment ${schedule.installmentNo}`
    );
  }

  console.log("Penalty Job Completed");
};