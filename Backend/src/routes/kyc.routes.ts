// src/routes/kyc.routes.ts
import { Router } from "express";
import {
  submitKYCController,
  getKYCController,
  getPendingKYCController,
  tellerVerifyKYCController,
} from "../controller/kyc.controller";
import { authenticateUser, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateUser);

// 1. Customer Submissions
router.post("/submit", submitKYCController);

// 2. Staff KYC Verification Endpoints (Allowed for BANK_TELLER and ADMIN)
router.get(
  "/admin/pending",
  requireRole("BANK_TELLER", "ADMIN"),
  getPendingKYCController
);

router.patch(
  "/admin/verify/:kycId",
  requireRole("BANK_TELLER", "ADMIN"),
  tellerVerifyKYCController
);

// 3. Customer Profile KYC Lookup
router.get("/:custId", getKYCController);

export default router;