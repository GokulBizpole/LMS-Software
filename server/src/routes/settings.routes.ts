import { Router } from "express";
import {
  deleteLogo,
  getSettings,
  updateSettings,
  uploadLogo,
} from "../controllers/settings.controller";

import { authenticate } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";
import { uploadCompanyLogo } from "../middleware/upload.middleware";

const router = Router();

router.get("/", authenticate, adminOnly, getSettings);

router.put("/", authenticate, adminOnly, updateSettings);

router.post("/logo", authenticate, adminOnly, uploadCompanyLogo, uploadLogo);

router.delete("/logo", authenticate, adminOnly, deleteLogo);

export default router;
