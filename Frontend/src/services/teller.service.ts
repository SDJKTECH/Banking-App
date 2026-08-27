// src/services/teller.service.ts
import { api } from "./api";
import { ApiResponse } from "../types/api.types";
import { CustomerProfile } from "../types/customer.types";
import {
  OnboardCustomerPayload,
  OnboardCustomerResponse,
  TellerSearchFilters,
  PaginatedCustomersResponse,
  UpdateCustomerPayload,
  TellerDepositPayload,
  TellerWithdrawPayload,
  TellerTransferPayload,
  TellerTxnResponse,
  TellerTransferResponse,
  TellerStatementFilters,
  TellerStatementItem,
  GrantLoanPayload,
  GrantLoanResponse,
  PayEMIPayload,
  PayEMIResponse,
} from "../types/teller.types";

export const tellerService = {
  // ==========================================
  // CUSTOMER MANAGEMENT
  // ==========================================

  /** Onboard a customer, create initial account, and email credentials */
  onboardCustomer: async (
    payload: OnboardCustomerPayload
  ): Promise<ApiResponse<OnboardCustomerResponse>> => {
    const res = await api.post<ApiResponse<OnboardCustomerResponse>>(
      "/teller/customers",
      payload
    );
    return res.data;
  },

  /** Advance search customers by ID, Name, Email, or Mobile (Paginated) */
  searchCustomers: async (
    filters?: TellerSearchFilters
  ): Promise<ApiResponse<PaginatedCustomersResponse>> => {
    const res = await api.get<ApiResponse<PaginatedCustomersResponse>>(
      "/teller/customers/search",
      { params: filters }
    );
    return res.data;
  },

  /** Update customer profile data from teller terminal */
  updateCustomer: async (
    custId: string,
    payload: UpdateCustomerPayload
  ): Promise<ApiResponse<CustomerProfile>> => {
    const res = await api.put<ApiResponse<CustomerProfile>>(
      `/teller/customers/${custId}`,
      payload
    );
    return res.data;
  },

  /** Soft-delete or cascade remove customer */
  deleteCustomer: async (custId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/teller/customers/${custId}`);
    return res.data;
  },

  // ==========================================
  // ACCOUNT PROVISIONING & ACTIONS
  // ==========================================

  /** Create additional account for existing customer */
  createSecondaryAccount: async (payload: {
    CustID: string;
    AccountType: "SAVING" | "LOAN";
    InitialDeposit?: number;
    BranchCode?: string;
    IFSCCode?: string;
  }): Promise<ApiResponse<any>> => {
    const res = await api.post<ApiResponse<any>>("/teller/accounts", payload);
    return res.data;
  },

  /** Close/Deactivate an account */
  closeAccount: async (acctNum: string): Promise<ApiResponse<null>> => {
    const res = await api.patch<ApiResponse<null>>(
      `/teller/accounts/${acctNum}/close`
    );
    return res.data;
  },

  // ==========================================
  // CASH OPERATIONS (CASH COUNTER)
  // ==========================================

  /** Counter Cash Deposit */
  deposit: async (
    payload: TellerDepositPayload
  ): Promise<ApiResponse<TellerTxnResponse>> => {
    const res = await api.post<ApiResponse<TellerTxnResponse>>(
      "/teller/transactions/deposit",
      payload
    );
    return res.data;
  },

  /** Counter Cash Dispensation / Withdrawal */
  withdraw: async (
    payload: TellerWithdrawPayload
  ): Promise<ApiResponse<TellerTxnResponse>> => {
    const res = await api.post<ApiResponse<TellerTxnResponse>>(
      "/teller/transactions/withdraw",
      payload
    );
    return res.data;
  },

  /** Assisted Inter-Account Transfer */
  transfer: async (
    payload: TellerTransferPayload
  ): Promise<ApiResponse<TellerTransferResponse>> => {
    const res = await api.post<ApiResponse<TellerTransferResponse>>(
      "/teller/transactions/transfer",
      payload
    );
    return res.data;
  },

  // ==========================================
  // STATEMENTS & AUDIT LEDGER
  // ==========================================

  /** Fetch global or per-account audit statement */
  fetchStatements: async (
    filters?: TellerStatementFilters
  ): Promise<ApiResponse<TellerStatementItem[]>> => {
    const res = await api.get<ApiResponse<TellerStatementItem[]>>(
      "/teller/transactions/statements",
      { params: filters }
    );
    return res.data;
  },

  // ==========================================
  // LOANS & EMI SERVICING
  // ==========================================

  /** Disburse loan and auto-generate EMI schedule */
  grantLoan: async (
    payload: GrantLoanPayload
  ): Promise<ApiResponse<GrantLoanResponse>> => {
    const res = await api.post<ApiResponse<GrantLoanResponse>>(
      "/teller/loans/grant",
      payload
    );
    return res.data;
  },

  /** Process teller-counter EMI installment payment */
  payLoanEMI: async (
    payload: PayEMIPayload
  ): Promise<ApiResponse<PayEMIResponse>> => {
    const res = await api.post<ApiResponse<PayEMIResponse>>(
      "/teller/loans/pay-emi",
      payload
    );
    return res.data;
  },
};