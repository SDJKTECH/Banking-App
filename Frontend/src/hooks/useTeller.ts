// src/hooks/useTeller.ts
import { useState, useCallback, useRef } from "react";
import { kycService } from "../services/kyc.service";
import type { KYCQueueItem } from "../components/teller/TellerKYCQueue";
import { tellerService } from "../services/teller.service";
import type { CustomerProfile } from "../types/customer.types";
import type {
  TellerSearchFilters,
  PaginationMeta,
  OnboardCustomerPayload,
  UpdateCustomerPayload,
  TellerDepositPayload,
  TellerWithdrawPayload,
  TellerTransferPayload,
  TellerStatementFilters,
  TellerStatementItem,
  GrantLoanPayload,
  PayEMIPayload,
} from "../types/teller.types";

export function useTeller() {
  // Customer Directory State & Pagination
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Statements & Audit Ledger State & Pagination
  const [statements, setStatements] = useState<TellerStatementItem[]>([]);
  const [statementPagination, setStatementPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });

  // UI Status State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [kycQueue, setKycQueue] = useState<KYCQueueItem[]>([]);

  // Tracks active search parameters and active page index
  const lastFiltersRef = useRef<TellerSearchFilters>({ page: 1, pageSize: 10 });

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // 🔍 Server-side Paginated Customer Search
  const searchCustomers = useCallback(async (filters?: TellerSearchFilters) => {
    setLoading(true);
    setError(null);

    const mergedFilters: TellerSearchFilters = {
      page: filters?.page ?? lastFiltersRef.current.page ?? 1,
      pageSize: filters?.pageSize ?? 10,
      ...filters,
    };
    lastFiltersRef.current = mergedFilters;

    try {
      const res = await tellerService.searchCustomers(mergedFilters);
      const resData = res.data as any;

      const fetched: CustomerProfile[] = Array.isArray(resData)
        ? resData
        : resData?.customers || [];
      const meta: PaginationMeta = resData?.pagination || {
        page: mergedFilters.page || 1,
        pageSize: mergedFilters.pageSize || 10,
        totalCount: fetched.length,
        totalPages: 1,
      };

      setCustomers(fetched);
      setPagination(meta);

      // Synchronize active selected customer details with latest fetched balance
      setSelectedCustomer((prev) => {
        if (!prev) return null;
        const fresh = fetched.find((c) => c.CustID === prev.CustID);
        return fresh || prev;
      });

      return fetched;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to retrieve customers");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ➕ Onboard New Customer
  const onboardCustomer = async (payload: OnboardCustomerPayload) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await tellerService.onboardCustomer(payload);
      setSuccessMessage(`Customer ${res.data.customer.CustID} onboarded successfully.`);
      await searchCustomers({ page: 1 });
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Customer onboarding failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 💳 Create Additional Account
  const createAccount = async (payload: {
    CustID: string;
    AccountType: "SAVING" | "LOAN";
    InitialDeposit?: number;
    BranchCode?: string;
    IFSCCode?: string;
  }) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await tellerService.createSecondaryAccount(payload);
      setSuccessMessage(`Account ${res.data.account.AcctNum} created successfully.`);
      await searchCustomers(lastFiltersRef.current);
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Account creation failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Update Customer
  const updateCustomer = async (custId: string, payload: UpdateCustomerPayload) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await tellerService.updateCustomer(custId, payload);
      setSuccessMessage(`Customer ${custId} updated successfully.`);
      await searchCustomers(lastFiltersRef.current);
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Customer update failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete Customer
  const deleteCustomer = async (custId: string) => {
    setLoading(true);
    clearMessages();
    try {
      await tellerService.deleteCustomer(custId);
      setSuccessMessage(`Customer ${custId} removed.`);
      if (selectedCustomer?.CustID === custId) setSelectedCustomer(null);
      await searchCustomers(lastFiltersRef.current);
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Customer deletion failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Close Account
  const closeAccount = async (acctNum: string) => {
    setLoading(true);
    clearMessages();
    try {
      await tellerService.closeAccount(acctNum);
      setSuccessMessage(`Account ${acctNum} closed.`);
      await searchCustomers(lastFiltersRef.current);
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to close account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 💵 Deposit Cash
  const depositCash = async (payload: TellerDepositPayload) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await tellerService.deposit({
        ...payload,
        AcctNum: payload.AcctNum.replace(/\s+/g, ""),
      });
      setSuccessMessage(`₹${payload.Amount.toLocaleString("en-IN")} deposited to ${payload.AcctNum}.`);
      await searchCustomers(lastFiltersRef.current);
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Deposit failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🏧 Withdraw Cash
  const withdrawCash = async (payload: TellerWithdrawPayload) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await tellerService.withdraw({
        ...payload,
        AcctNum: payload.AcctNum.replace(/\s+/g, ""),
      });
      setSuccessMessage(`₹${payload.Amount.toLocaleString("en-IN")} dispensed from ${payload.AcctNum}.`);
      await searchCustomers(lastFiltersRef.current);
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Withdrawal failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Transfer Funds
  const transferFunds = async (payload: TellerTransferPayload) => {
    setLoading(true);
    clearMessages();
    try {
      const cleanPayload = {
        ...payload,
        SourceAcctNum: payload.SourceAcctNum.replace(/\s+/g, ""),
        DestinationAcctNum: payload.DestinationAcctNum.replace(/\s+/g, ""),
      };
      const res = await tellerService.transfer(cleanPayload);
      setSuccessMessage(
        `₹${payload.Amount.toLocaleString("en-IN")} transferred from ${cleanPayload.SourceAcctNum} to ${cleanPayload.DestinationAcctNum}.`
      );
      await searchCustomers(lastFiltersRef.current);
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Transfer failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📊 Statements (Paginated & Filtered)
  const fetchStatements = useCallback(async (filters?: TellerStatementFilters) => {
    setLoading(true);
    try {
      const res = await tellerService.fetchStatements(filters);
      const resData = res.data as any;

      if (Array.isArray(resData)) {
        setStatements(resData);
        setStatementPagination({
          page: 1,
          pageSize: resData.length || 10,
          totalCount: resData.length,
          totalPages: 1,
        });
        return resData;
      } else if (resData && typeof resData === "object") {
        const list = resData.statements || [];
        setStatements(list);
        if (resData.pagination) {
          setStatementPagination(resData.pagination);
        }
        return list;
      } else {
        setStatements([]);
        return [];
      }
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to fetch statements");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 📑 Grant Loan
  const grantLoan = async (payload: GrantLoanPayload) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await tellerService.grantLoan(payload);
      setSuccessMessage(`Loan disbursed. Account: ${res.data.account.AcctNum}.`);
      await searchCustomers(lastFiltersRef.current);
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Loan origination failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 💳 Pay Loan EMI
  const payLoanEMI = async (payload: PayEMIPayload) => {
    setLoading(true);
    clearMessages();
    try {
      const res = await tellerService.payLoanEMI(payload);
      setSuccessMessage(`EMI payment received. Outstanding balance: ₹${res.data.remainingLoanBalance}.`);
      await searchCustomers(lastFiltersRef.current);
      return res.data;
    } catch (err: any) {
      setError(typeof err === "string" ? err : "EMI payment processing failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆔 KYC Operations
  const fetchKycQueue = useCallback(async () => {
    try {
      const res = await kycService.getPendingQueue();
      setKycQueue(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch KYC queue:", err);
    }
  }, []);

  const approveKyc = async (kycId: string) => {
    clearMessages();
    try {
      await kycService.verifyKYC(kycId, "VERIFIED");
      setSuccessMessage("KYC successfully verified and approved.");
      await fetchKycQueue();
      await searchCustomers(lastFiltersRef.current);
    } catch (err: any) {
      setError(err.response?.data?.message || "KYC approval failed");
    }
  };

  const rejectKyc = async (kycId: string) => {
    clearMessages();
    try {
      await kycService.verifyKYC(kycId, "REJECTED");
      setSuccessMessage("KYC application rejected.");
      await fetchKycQueue();
      await searchCustomers(lastFiltersRef.current);
    } catch (err: any) {
      setError(err.response?.data?.message || "KYC rejection failed");
    }
  };

  return {
    customers,
    pagination,
    selectedCustomer,
    setSelectedCustomer,
    statements,
    statementPagination,
    kycQueue,
    fetchKycQueue,
    approveKyc,
    rejectKyc,
    loading,
    error,
    successMessage,
    clearMessages,
    searchCustomers,
    fetchStatements,
    onboardCustomer,
    createAccount,
    updateCustomer,
    deleteCustomer,
    closeAccount,
    depositCash,
    withdrawCash,
    transferFunds,
    grantLoan,
    payLoanEMI,
  };
}