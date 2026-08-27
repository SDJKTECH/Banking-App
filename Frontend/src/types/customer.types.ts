export interface AccountType {
  AccountTypeID: number;
  AccountType: "SAVING" | "LOAN";
}

export interface SavingAccountDetail {
  AcctNum: string;
  SavingAccountTypeId: number;
  Balance: number;
  TransferLimit: number;
  BranchCode: string;
  IFSCCode?: string;
}

export interface LoanAccountDetail {
  AcctNum: string;
  BalanceAmount: number;
  BranchCode: string;
  IFSCCode?: string;
  RateOfInterest: number;
  LoanDuration: number;
  TotalLoanAmount: number;
  LoanAccountTypeId: number;
}

export interface CustomerAccount {
  AcctNum: string;
  CustID: string;
  AccountTypeID: number;
  AccountType: AccountType;
  SavingAccount?: SavingAccountDetail | null;
  LoanAccount?: LoanAccountDetail | null;
}

export interface CustomerProfile {
  CustID: string;
  FirstName: string;
  LastName: string;
  Address1: string;
  Address2?: string | null;
  City: string;
  State: string;
  Country: string;
  ZIPCode: string;
  EmailId: string;
  Phone?: string | null;
  Mobile: string;
  DOB: string;
  MaritalStatus?: string | null;
  Accounts?: CustomerAccount[];
  User?: {
    UserID: string;
    Email: string;
    Role: string;
    CreatedAt: string;
  } | null;
}

export interface UpdateCustomerPayload {
  FirstName?: string;
  LastName?: string;
  Address1?: string;
  Address2?: string | null;
  City: string;
  State: string;
  Country: string;
  ZIPCode: string;
  EmailId?: string;
  Phone?: string | null;
  Mobile?: string;
  MaritalStatus?: string | null;
}

export interface SearchCustomerParams {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
}

export interface KYCRecord {
  KYCID: string;
  CustID: string;
  DocumentType: string;
  DocumentNumber: string;
  IssueDate: string;
  ExpiryDate?: string | null;
  VerificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface SubmitKYCPayload {
  CustID: string;
  DocumentType: string;
  DocumentNumber: string;
  IssueDate: string;
  ExpiryDate?: string;
}