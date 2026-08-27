// src/types/tellerUI.types.ts
import type { CustomerProfile } from "./customer.types";

export type CashActionType = "DEPOSIT" | "WITHDRAW" | "TRANSFER";

export type ActiveTellerModal =
  | { type: "ONBOARD" }
  | { type: "CREATE_ACCOUNT"; customer: CustomerProfile }
  | { type: "EDIT_CUSTOMER"; customer: CustomerProfile }
  | { type: "VIEW_DETAILS"; customer: CustomerProfile }
  | {
      type: "CASH_ACTION";
      mode: CashActionType;
      acctNum: string;
      balance: number;
    }
  | {
      type: "GRANT_LOAN";
      custId?: string;
      preselectedAcctNum?: string; // 👈 declared here
    }
  | {
      type: "PAY_EMI";
      acctNum: string;
      remainingBalance: number;
      customerName?: string;
    }
  | null;