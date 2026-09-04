import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes";
import customerRoutes from "./src/routes/customer.routes";
import transactionRoutes from "./src/routes/transaction.routes";
import kycRoutes from "./src/routes/kyc.routes";
import tellerRoutes from "./src/routes/teller.routes"; // 👈 Import Teller routes
import { notFound } from "./src/middleware/notFound";
import { errorHandler } from "./src/middleware/errorHandler";
import { logger } from "./src/lib/logger";

const app = express();

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON payloads
app.use(express.json());

// Incoming Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Mounted Route Namespaces
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/teller", tellerRoutes); // 👈 Dedicated Teller Portal routes

// 404 Handler for unknown routes
app.use(notFound);

// Global Error Handler (MUST BE LAST!)
app.use(errorHandler);

export default app;