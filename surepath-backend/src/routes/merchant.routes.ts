import { Router } from "express";
import { merchantController } from "../controllers/merchant.controller";
import { requireApiKey } from "../middleware/api-key.middleware";
import { createMerchantValidator, updateMerchantValidator, getMerchantsValidator, } from "../validators/merchant.validator";
import { validate } from "../middleware/validation.middleware";
import { requireSession } from "../middleware/auth.middleware";
import { merchantProfileController } from "../controllers/merchant-profile.controller";
import { updateMerchantProfileValidator } from "../validators/merchant-profile.validator";
import { merchantContactController } from "../controllers/merchant-contact.controller";
import { createMerchantContactValidator, updateMerchantContactValidator } from "../validators/merchant-contact.validator";
import { merchantNoteController } from "../controllers/merchant-note.controller";
import { createMerchantNoteValidator, } from "../validators/merchant-note.validator";
import { merchantActivityController } from "../controllers/merchant-activity.controller";
import { createMerchantActivityValidator, } from "../validators/merchant-activity.validator";
import { merchantTaskController } from "../controllers/merchant-task.controller";
import { createMerchantTaskValidator } from "../validators/merchant-task.validator";
import { merchantDetectionController } from "../controllers/merchant-detection.controller";
import { createMerchantDetectionValidator, updateMerchantDetectionValidator, } from "../validators/merchant-detection.validator";
import { merchantScoreController } from "../controllers/merchant-score.controller";
import { researchRunController } from "../controllers/research-run.controller";
import { getMerchantProvenanceValidator } from "../validators/merchant-provenance.validator";
import { getMerchantProvenance } from "../controllers/merchant-provenance.controller";
import { merchantExportValidator } from "../validators/merchant-export.validator";
import { exportMerchants } from "../controllers/merchant-export.controller";

const router = Router();

// Using Api-Key-Check Middleware Checking Api Key For Each Routes 
router.use(requireApiKey);

// Get All Merchants Route
router.get("/", requireSession,
    getMerchantsValidator,
    validate,
    merchantController.getAll);

// Exports Route 

router.get(
    "/export",
    requireSession,
    merchantExportValidator,
    validate,
    exportMerchants
);


// Merchants Profile Routes 
router.get(
    "/:id/profile",
    requireSession,
    merchantProfileController.getByMerchantId
);

router.patch(
    "/:id/profile",
    requireSession,
    updateMerchantProfileValidator,
    validate,
    merchantProfileController.update
);


// Merchants Contacts Routes 

router.get(
    "/:id/contacts",
    requireSession,
    merchantContactController.getByMerchantId
);

router.post(
    "/:id/contacts",
    requireSession,
    createMerchantContactValidator,
    validate,
    merchantContactController.create
);

router.patch(
    "/:id/contacts/:contact_id",
    requireSession,
    updateMerchantContactValidator,
    validate,
    merchantContactController.update
);

router.delete(
    "/:id/contacts/:contact_id",
    requireSession,
    merchantContactController.delete
);


// Merchants Notes Routes 

router.get(
    "/:id/notes",
    requireSession,
    merchantNoteController.getByMerchantId
);

router.post(
    "/:id/notes",
    requireSession,
    createMerchantNoteValidator,
    validate,
    merchantNoteController.create
);

router.delete(
    "/:id/notes/:note_id",
    requireSession,
    merchantNoteController.delete
);

// Merchants Activities Routes 

router.get(
    "/:id/activities",
    requireSession,
    merchantActivityController.getByMerchantId
);

router.post(
    "/:id/activities",
    requireSession,
    createMerchantActivityValidator,
    validate,
    merchantActivityController.create
);

// Merchants Tasks Routes 

router.get(
    "/:id/tasks",
    requireSession,
    merchantTaskController.getByMerchantId
);

router.post(
    "/:id/tasks",
    requireSession,
    createMerchantTaskValidator,
    validate,
    merchantTaskController.create
);

// Merchants Detections Routes 
router.get(
    "/:id/detections",
    requireSession,
    merchantDetectionController.getByMerchantId
);

router.post(
    "/:id/detections",
    requireSession,
    createMerchantDetectionValidator,
    validate,
    merchantDetectionController.create
);

router.patch(
    "/:id/detections/:detection_id",
    requireSession,
    updateMerchantDetectionValidator,
    validate,
    merchantDetectionController.update
);

// Merchants Score Route
router.get(
    "/:id/scores",
    requireSession,
    merchantScoreController.getByMerchantId
);

// Merchants Reasearch Runs Route
router.get(
    "/:merchant_id/research-runs",
    requireSession,
    researchRunController.getByMerchantId
);

// Merchants Proverance Route

router.get(
    "/:merchant_id/provenance",
    requireSession,
    getMerchantProvenanceValidator,
    validate,
    getMerchantProvenance
);


// Merchants Routes 

router.get("/:id",
    requireSession,
    merchantController.getById);

router.post(
    "/",
    requireSession,
    createMerchantValidator,
    validate,
    merchantController.create
);

router.patch(
    "/:id",
    requireSession,
    updateMerchantValidator,
    validate,
    merchantController.update
);

router.delete("/:id",
    requireSession,
    merchantController.delete);



export default router;