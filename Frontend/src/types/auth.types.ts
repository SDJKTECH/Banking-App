export type AccountTypeName = "SAVING" | "LOAN";

// Decoded user data inside the JWT and stored in app state
export interface UserSession {
  id: number;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "BANK_TELLER";
  custId: string;
  customerName: string | null;
}

// POST /api/auth/login Request Body
export interface LoginPayload {
  Email: string;
  Password: string;
}

// POST /api/auth/login Response Data
export interface LoginData {
  token: string;
  user: UserSession;
}

// POST /api/auth/create-account Request Body
export interface CreateAccountPayload {
  // Auth details
  Password: string;

  // Customer details
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
}