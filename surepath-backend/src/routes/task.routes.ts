import { Router } from "express";
import { merchantTaskController } from "../controllers/merchant-task.controller";
import { taskQueueValidator } from "../validators/task-queue.validator";
import { updateMerchantTaskValidator } from "../validators/merchant-task.validator";
import { validate } from "../middleware/validation.middleware";
import { requireSession } from "../middleware/auth.middleware";
import { requireApiKey } from "../middleware/api-key.middleware";

const router = Router();
router.use(requireApiKey)

router.get(
  "/summary",
  requireSession,
  merchantTaskController.getSummary
);

router.get(
  "/",
  requireSession,
  taskQueueValidator,
  validate,
  merchantTaskController.getAll
);

router.patch(
  "/:id",
  requireSession,
  updateMerchantTaskValidator,
  validate,
  merchantTaskController.update
);

router.delete(
  "/:id",
  requireSession,
  merchantTaskController.delete
);

export default router;