// src/routes/teller.routes.ts
import { Router } from "express";
import {
  tellerCreateCustomer,
  tellerSearchCustomers,
  tellerUpdateCustomer,
  tellerCloseAccount,
  tellerDeleteCustomer,
  tellerCreateAccount,
  tellerDeposit,
  tellerWithdraw,
  tellerTransfer,
  tellerStatements,
  tellerGrantLoan,
  tellerPayEMI,
  tellerGetCustomers,
  tellerGetUnappliedKYCCustomers, // 👈 Added import for unapplied KYC pagination
} from "../controller/teller.controller";
import { authenticateUser, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Teller and Admin route protection
router.use(authenticateUser);
router.use(requireRole("ADMIN", "BANK_TELLER"));

// Customer Management Endpoints
router.post("/customers", tellerCreateCustomer);
router.get("/customers", tellerGetCustomers);
router.get("/customers/search", tellerSearchCustomers);
router.put("/customers/:custId", tellerUpdateCustomer);
router.delete("/customers/:custId", tellerDeleteCustomer);

// Account Management Endpoints
router.post("/accounts", tellerCreateAccount);
router.patch("/accounts/:acctNum/close", tellerCloseAccount);

// KYC Compliance Endpoints
router.get("/kyc/unapplied", tellerGetUnappliedKYCCustomers); // 👈 Paginated Non-KYC customers endpoint

// Teller Cash Operations
router.post("/transactions/deposit", tellerDeposit);
router.post("/transactions/withdraw", tellerWithdraw);
router.post("/transactions/transfer", tellerTransfer);

// Statements & Global Ledger
router.get("/transactions/statements", tellerStatements);

// Loan Origination & EMI Servicing
router.post("/loans/grant", tellerGrantLoan);
router.post("/loans/pay-emi", tellerPayEMI);

export default router;