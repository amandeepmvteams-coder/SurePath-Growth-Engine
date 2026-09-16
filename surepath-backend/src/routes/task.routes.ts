import { Router } from "express";
import { merchantTaskController } from "../controllers/merchant-task.controller";
import { taskQueueValidator } from "../validators/task-queue.validator";
import { updateMerchantTaskValidator } from "../validators/merchant-task.validator";
import { validate } from "../middleware/validation.middleware";
import { requireSession } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/summary",
  merchantTaskController.getSummary
);

router.get(
  "/",
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