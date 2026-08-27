// src/services/kyc.service.ts
import { api } from "./api";
import { ApiResponse } from "../types/api.types";
import { PaginationMeta } from "../types/teller.types";

export interface UnappliedCustomerItem {
  CustID: string;
  FirstName: string;
  LastName: string;
  EmailId: string;
  Mobile: string;
  City: string;
  State: string;
  CreatedAt?: string;
}

export interface PaginatedUnappliedResponse {
  customers: UnappliedCustomerItem[];
  pagination: PaginationMeta;
}

export const kycService = {
  submitKYC: async (payload: {
    CustID: string;
    DocumentType: string;
    DocumentNumber: string;
    IssueDate: string;
    ExpiryDate?: string;
  }) => {
    const res = await api.post("/kyc/submit", payload);
    return res.data;
  },

  getKYCByCustId: async (custId: string) => {
    const res = await api.get(`/kyc/${custId}`);
    return res.data;
  },

  // Alias for backwards-compatibility with DashboardPage.tsx
  getKYC: async (custId: string) => {
    const res = await api.get(`/kyc/${custId}`);
    return res.data;
  },

  getPendingQueue: async () => {
    const res = await api.get("/kyc/admin/pending");
    return res.data;
  },

  verifyKYC: async (kycId: string, status: "VERIFIED" | "REJECTED") => {
    const res = await api.patch(`/kyc/admin/verify/${kycId}`, { status });
    return res.data;
  },

  /** 🛡️ Fetch page-wise list of customers who haven't submitted KYC */
  getUnappliedCustomers: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedUnappliedResponse>> => {
    const res = await api.get<ApiResponse<PaginatedUnappliedResponse>>(
      "/teller/kyc/unapplied",
      { params }
    );
    return res.data;
  },
};