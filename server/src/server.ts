import app from "./app";
import { startPenaltyCron } from "./cron/penalty.cron";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startPenaltyCron();
});