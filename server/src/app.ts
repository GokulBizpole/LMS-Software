import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes";
import partnerRoutes from "./routes/partner.routes";
import customerRoutes from "./routes/customer.routes";
import loanRoutes from "./routes/loan.routes";
import paymentRoutes from "./routes/payment.routes";
import expenseRoutes from "./routes/expense.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import reportRoutes from "./routes/report.routes";
import authRoutes from "./routes/auth.routes";
import settingsRoutes from "./routes/settings.routes";
import notificationRoutes from "./routes/notification.routes";
import auditRoutes from "./routes/audit.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditRoutes);

app.get("/", (_, res) => {
  res.json({ message: "LMS Finance API Running 🚀" });
});

export default app;