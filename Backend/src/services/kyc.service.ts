// src/services/kyc.service.ts
import {
  findKYCByCustId,
  createOrUpdateKYC,
  findPendingKYCRecords,
  updateKYCStatus,
  VerificationStatus,
} from "../repository/kyc.repository";
import { findCustomerByUserId } from "../repository/customer.repository";
import { NotFoundError, BadRequestError } from "../errors/AppError";

export async function submitKYC(data: {
  CustID: string;
  DocumentType: string;
  DocumentNumber: string;
  IssueDate: Date;
  ExpiryDate: Date;
}) {
  return await createOrUpdateKYC({
    CustID: data.CustID,
    DocumentType: data.DocumentType,
    DocumentNumber: data.DocumentNumber,
    IssueDate: data.IssueDate,
    ExpiryDate: data.ExpiryDate,
    VerificationStatus: "PENDING",
  });
}

export async function getCustomerKYC(custId: string) {
  const kyc = await findKYCByCustId(custId);
  return kyc || null;
}

// 🛡️ Maps to repository's findPendingKYCRecords
export async function getPendingKYCQueue() {
  return await findPendingKYCRecords();
}

// 🛡️ Staff (Teller/Admin) verification
export async function verifyKYCByStaff(kycId: string, statusInput: string) {
  let normalizedStatus: VerificationStatus;
  
  const upperStatus = String(statusInput || "").toUpperCase();
  if (upperStatus === "APPROVED" || upperStatus === "VERIFIED") {
    normalizedStatus = "VERIFIED";
  } else if (upperStatus === "REJECTED") {
    normalizedStatus = "REJECTED";
  } else {
    throw new BadRequestError("Status must be either 'VERIFIED' (or 'APPROVED') or 'REJECTED'");
  }

  const updated = await updateKYCStatus(kycId, normalizedStatus);
  if (!updated) {
    throw new NotFoundError("KYC record not found");
  }
  return updated;
}

// Clean submission action using repository layer instead of prisma
export async function submitCustomerKYCAction(
  userId: string,
  data: {
    DocumentType: string;
    DocumentNumber: string;
    IssueDate: Date;
    ExpiryDate?: Date | null;
  }
) {
  const customer = await findCustomerByUserId(userId);

  if (!customer) {
    throw new BadRequestError("Customer profile not found for this user account");
  }

  return await createOrUpdateKYC({
    CustID: customer.CustID,
    DocumentType: data.DocumentType,
    DocumentNumber: data.DocumentNumber,
    IssueDate: data.IssueDate,
    ExpiryDate: data.ExpiryDate || null,
    VerificationStatus: "PENDING",
  });
}