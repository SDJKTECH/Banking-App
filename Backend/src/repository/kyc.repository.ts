// src/repository/kyc.repository.ts
import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";
import crypto from "node:crypto";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

type DBClient = Prisma.TransactionClient | typeof prisma;

// 1. Fetch KYC by Customer ID
export async function findKYCByCustId(custId: string, db: DBClient = prisma) {
  return db.kYCDetail.findUnique({
    where: { CustID: custId },
  });
}

// 2. Create or Update KYC
export async function createOrUpdateKYC(
  data: {
    CustID: string;
    DocumentType: string;
    DocumentNumber: string;
    IssueDate: Date;
    ExpiryDate?: Date | null;
    VerificationStatus?: string;
  },
  db: DBClient = prisma
) {
  const status = (data.VerificationStatus as VerificationStatus) || "PENDING";

  return db.kYCDetail.upsert({
    where: { CustID: data.CustID },
    create: {
      KYCID: crypto.randomUUID(),
      CustID: data.CustID,
      DocumentType: data.DocumentType,
      DocumentNumber: data.DocumentNumber,
      IssueDate: data.IssueDate,
      ExpiryDate: data.ExpiryDate || null,
      VerificationStatus: status,
    },
    update: {
      DocumentType: data.DocumentType,
      DocumentNumber: data.DocumentNumber,
      IssueDate: data.IssueDate,
      ExpiryDate: data.ExpiryDate || null,
      VerificationStatus: status,
    },
  });
}

// 3. Admin / Staff function to approve or reject KYC by KYCID
export async function updateKYCStatus(
  kycId: string,
  status: VerificationStatus,
  db: DBClient = prisma
) {
  return db.kYCDetail.update({
    where: { KYCID: kycId },
    data: { VerificationStatus: status },
    include: {
      Customer: true,
    },
  });
}

// 4. Fetch all pending KYC verifications for the review queue
export async function findPendingKYCRecords(db: DBClient = prisma) {
  return db.kYCDetail.findMany({
    where: { VerificationStatus: "PENDING" },
    include: {
      Customer: true,
    },
    orderBy: { UpdatedAt: "asc" },
  });
}

// 5. Fetch Non-KYC / Unapplied customers page by page from the database
export async function findPaginatedUnappliedKYCCustomers(
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
  },
  db: DBClient = prisma
) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const skip = (page - 1) * pageSize;

  const where: Prisma.CustomerDetailWhereInput = {
    // Exclude internal bank staff
    User: {
      Role: {
        notIn: ["ADMIN", "BANK_TELLER"],
      },
    },
    // Filter customers who have never submitted a KYC record
    KYC: null,
  };

  if (params.search && params.search.trim()) {
    const term = params.search.trim();
    where.OR = [
      { CustID: { contains: term, mode: "insensitive" } },
      { FirstName: { contains: term, mode: "insensitive" } },
      { LastName: { contains: term, mode: "insensitive" } },
      { EmailId: { contains: term, mode: "insensitive" } },
      { Mobile: { contains: term } },
    ];
  }

  const [totalCount, customers] = await Promise.all([
    db.customerDetail.count({ where }),
    db.customerDetail.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        CustID: true,
        FirstName: true,
        LastName: true,
        EmailId: true,
        Mobile: true,
        City: true,
        State: true,
        CreatedAt: true,
      },
      orderBy: [{ FirstName: "asc" }, { LastName: "asc" }],
    }),
  ]);

  return {
    customers,
    pagination: {
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    },
  };
}