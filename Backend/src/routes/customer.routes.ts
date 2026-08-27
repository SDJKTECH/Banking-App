import { Router } from "express";
import {
  searchCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  deleteCustomerController,
} from "../controller/customer.controller";
import { authenticateUser, requireRole } from "../middleware/auth.middleware";

const customerRouter = Router();

// Protect all customer routes with JWT authentication
customerRouter.use(authenticateUser);

// 1. Advanced Customer Search (MUST be placed before /:custId to avoid route shadowing)
customerRouter.get("/search", searchCustomersController);

// 2. Individual Customer Profile Management
customerRouter.get("/:custId", getCustomerByIdController);
customerRouter.put("/:custId", updateCustomerController);

// 3. Admin / Staff Only: Cascading Customer Deletion
customerRouter.delete(
  "/:custId",
  requireRole("ADMIN", "TELLER"),
  deleteCustomerController
);

export default customerRouter;