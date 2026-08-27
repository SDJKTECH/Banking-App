import { Router } from "express";
import {
  withdrawController,
  transferController,
  getTransactionHistoryController,
  depositController
} from "../controller/transaction.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// Protect all transaction routes with JWT authentication
router.use(authenticateUser);

// Execute money operations
router.post("/deposit", depositController);
router.post("/withdraw", withdrawController);
router.post("/transfer", transferController);

// Retrieve account transaction statement/history
router.get("/:acctNum", getTransactionHistoryController);

export default router;