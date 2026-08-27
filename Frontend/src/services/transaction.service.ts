import { api } from "./api";
import { ApiResponse } from "../types/api.types";
import {
  WithdrawPayload,
  TransferPayload,
  TransactionRecord,
  WithdrawResponseData,
  TransferResponseData,
} from "../types/transaction.types";

export const transactionService = {
  /**
   * POST /api/transactions/withdraw
   */
  withdraw: async (
    payload: WithdrawPayload
  ): Promise<ApiResponse<WithdrawResponseData>> => {
    const response = await api.post<ApiResponse<WithdrawResponseData>>(
      "/transactions/withdraw",
      payload
    );
    return response.data;
  },

  /**
   * POST /api/transactions/transfer
   */
  transfer: async (
    payload: TransferPayload
  ): Promise<ApiResponse<TransferResponseData>> => {
    const response = await api.post<ApiResponse<TransferResponseData>>(
      "/transactions/transfer",
      payload
    );
    return response.data;
  },

  /**
   * GET /api/transactions/:acctNum
   */
  getHistory: async (
    acctNum: string,
    type?: "DEPOSIT" | "WITHDRAW" | "ALL"
  ): Promise<ApiResponse<TransactionRecord[]>> => {
    const response = await api.get<ApiResponse<TransactionRecord[]>>(
      `/transactions/${acctNum}`,
      { params: type && type !== "ALL" ? { type } : {} }
    );
    return response.data;
  },

  // Inside src/services/transaction.service.ts
    deposit: async (payload: {
    AcctNum: string;
    Amount: number;
    Remarks?: string;
    }) => {
    const response = await api.post("/transactions/deposit", payload);
    return response.data;
    },
};