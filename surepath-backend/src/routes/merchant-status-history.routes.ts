import { Router } from "express";
import { requireApiKey } from "../middleware/api-key.middleware";
import { merchantStatusHistoryController } from "../controllers/merchant-status-history.controller";

const router = Router();

router.use(requireApiKey);

router.get(
  "/:merchant_id/status-history",
  merchantStatusHistoryController.getByMerchantId
);

export default router;