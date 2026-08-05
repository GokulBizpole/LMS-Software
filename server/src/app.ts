import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.routes";
import partnerRoutes from "./routes/partner.routes";
import customerRoutes from "./routes/customer.routes";
import loanRoutes from "./routes/loan.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/loans", loanRoutes);

app.get("/", (_, res) => {
  res.json({ message: "LMS Finance API Running 🚀" });
});

export default app;