import cron from "node-cron";
import prisma from "../config/db";

export const startPenaltyCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running Auto Penalty Job...");

    const settings = await prisma.setting.findFirst();

    const penaltyPercentage =
      Number(settings?.defaultPenaltyPercentage ?? 2);

    const today = new Date();

    const overdueSchedules =
      await prisma.loanSchedule.findMany({
        where: {
          isPaid: false,
          dueDate: {
            lt: today,
          },
          penalty: 0,
        },
      });

    console.log(
      `Found ${overdueSchedules.length} overdue installments`
    );

    for (const schedule of overdueSchedules) {
      const penalty =
        (Number(schedule.amount) * penaltyPercentage) /
        100;

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
  });
};