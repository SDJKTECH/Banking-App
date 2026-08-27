// src/types/teller.types.ts
import { CustomerProfile, CustomerAccount } from "./customer.types";

// ==========================================
// PAGINATION TYPES
// ==========================================

export interface PaginationMeta {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedCustomersResponse {
  customers: CustomerProfile[];
  pagination: PaginationMeta;
}

// ==========================================
// CUSTOMER ONBOARDING & SEARCH
// ==========================================

export type AccountTypeName = "SAVING" | "LOAN";
export type AccountStatus = "ACTIVE" | "CLOSED" | "FROZEN";
export type EMIStatus = "PENDING" | "PAID" | "OVERDUE";

export interface OnboardCustomerPayload {
  FirstName: string;
  LastName: string;
  Address1: string;
  Address2?: string;
  City: string;
  State: string;
  Country: string;
  ZIPCode: string;
  EmailId: string;
  Phone?: string;
  Mobile: string;
  DOB: string; // YYYY-MM-DD
  MaritalStatus?: string;
  AccountType: AccountTypeName;
  BranchCode?: string;
  IFSCCode?: string;
  InitialDeposit?: number;
}

export interface OnboardCustomerResponse {
  customer: CustomerProfile;
  account: CustomerAccount;
  user: {
    id: string;
    email: string;
  };
}

export interface TellerSearchFilters {
  custId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateCustomerPayload {
  FirstName?: string;
  LastName?: string;
  Address1?: string;
  Address2?: string | null;
  City?: string;
  State?: string;
  Country?: string;
  ZIPCode?: string;
  EmailId?: string;
  Phone?: string | null;
  Mobile?: string;
  MaritalStatus?: string | null;
}

// ==========================================
// TELLER CASH & TRANSFER OPS
// ==========================================

export interface TellerDepositPayload {
  AcctNum: string;
  Amount: number;
  Remarks?: string;
}

export interface TellerWithdrawPayload {
  AcctNum: string;
  Amount: number;
  Remarks?: string;
}

export interface TellerTransferPayload {
  SourceAcctNum: string;
  DestinationAcctNum: string;
  Amount: number;
  Remarks?: string;
}

export interface TellerTxnResponse {
  acctNum?: string;
  deposited?: number;
  withdrawn?: number;
  balance: number;
  transaction: {
    TxnID: string;
    TxnDate: string;
    WithdrawAmount: number;
    DepositAmount: number;
    Balance: number;
    TxnDetail: string | null;
  };
}

export interface TellerTransferResponse {
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  sourceBalance: number;
  debitTxnId: string;
  creditTxnId: string;
}

// ==========================================
// STATEMENTS & GLOBAL LEDGER
// ==========================================

export interface TellerStatementFilters {
  acctNum?: string;
  limit?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  txnType?: "DEPOSIT" | "WITHDRAW";
  page?: number;     
  pageSize?: number;
}

export interface TellerStatementItem {
  TxnID: string;
  TxnDate: string;
  AcctNum: string;
  TxnDetail: string | null;
  WithdrawAmount: number;
  DepositAmount: number;
  Balance: number;
  Account?: {
    Account?: {
      CustID: string;
      Customer?: {
        FirstName: string;
        LastName: string;
        EmailId: string;
        Mobile: string;
      };
    };
  };
}

// ==========================================
// LOAN ORIGINATION & EMI SERVICING
// ==========================================

export interface GrantLoanPayload {
  CustID: string;
  AcctNum: string;
  TotalLoanAmount: number;
  RateOfInterest: number;
  LoanDurationMonths: number;
  BranchCode?: string;
  IFSCCode?: string;
}

export interface GrantLoanResponse {
  account: {
    AcctNum: string;
    CustID: string;
    AccountTypeID: number;
  };
  loan: {
    AcctNum: string;
    TotalLoanAmount: number;
    BalanceAmount: number;
    RateOfInterest: number;
    LoanDuration: number;
    BranchCode: string;
    IFSCCode: string;
  };
  monthlyEMI: number;
  totalInstallments: number;
}

export interface PayEMIPayload {
  EMIID?: string;
  AcctNum: string;
  Amount: number;
}

export interface PayEMIResponse {
  message: string;
  emiId: string;
  remainingLoanBalance: number;
}