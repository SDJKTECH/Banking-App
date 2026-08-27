// src/controllers/kyc.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  submitKYC,
  getCustomerKYC,
  getPendingKYCQueue,
  verifyKYCByStaff,
} from "../services/kyc.service";
import { BadRequestError } from "../errors/AppError";

export async function submitKYCController(req: Request, res: Response, next: NextFunction) {
  try {
    const { CustID, DocumentType, DocumentNumber, IssueDate, ExpiryDate } = req.body;
    const targetCustId = CustID || req.user?.custId;

    if (!targetCustId) {
      throw new BadRequestError("Customer ID is required");
    }

    const result = await submitKYC({
      CustID: targetCustId,
      DocumentType,
      DocumentNumber,
      IssueDate: new Date(IssueDate),
      ExpiryDate: ExpiryDate ? new Date(ExpiryDate) : new Date(),
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "KYC documents submitted successfully. Pending teller verification.",
      data: result,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        statusCode: 409,
        success: false,
        message: "This document number is already registered in the system.",
      });
    }
    next(error);
  }
}

export async function getKYCController(req: Request, res: Response, next: NextFunction) {
  try {
    const custId = req.params.custId as string;
    const kyc = await getCustomerKYC(custId);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "KYC details fetched successfully",
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPendingKYCController(req: Request, res: Response, next: NextFunction) {
  try {
    const pendingList = await getPendingKYCQueue();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Pending KYC list fetched successfully",
      data: pendingList,
    });
  } catch (error) {
    next(error);
  }
}

// 🛡️ Handles verification by Teller or Admin
export async function tellerVerifyKYCController(req: Request, res: Response, next: NextFunction) {
  try {
    const kycId = req.params.kycId as string;
    const { status } = req.body;

    const result = await verifyKYCByStaff(kycId, status);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: `KYC status updated to ${result.VerificationStatus} by staff`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}