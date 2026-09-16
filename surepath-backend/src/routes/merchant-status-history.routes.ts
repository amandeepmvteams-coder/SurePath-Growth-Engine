import { Router } from "express";
import { requireApiKey } from "../middleware/api-key.middleware";
import { merchantStatusHistoryController } from "../controllers/merchant-status-history.controller";
import { requireSession } from "../middleware/auth.middleware";

const router = Router();

router.use(requireApiKey);

router.get(
  "/:merchant_id/status-history",
  requireApiKey,
  requireSession,
  merchantStatusHistoryController.getByMerchantId
);

export default router;