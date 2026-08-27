import { AccountTypeName } from "../generated/prisma";
import {
  createAccount,
  createSavingAccountDetail,
  createLoanAccountDetail,
  findAccountTypeByName,
} from "../repository/account.repository";
import {
  createCustomer,
  findCustomerById,
  searchCustomers,
  updateCustomer,
  deleteCustomer,
} from "../repository/customer.repository";
import { createUser, findUserByEmail } from "../repository/auth.repository";

import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/AppError";

// 1. Create Bank Account & User Profile
export async function createBankAccount(data: {
  // Auth Details
  Password: string;

  // Customer Details
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
  DOB: Date | string;
  MaritalStatus?: string;
  AccountType: AccountTypeName;
}) {
  // Validate mandatory address fields
  if (!data.City || !data.State || !data.Country || !data.ZIPCode) {
    throw new BadRequestError("City, State, Country, and ZIPCode are mandatory fields");
  }

  // Check if user/email already exists
  const existingUser = await findUserByEmail(data.EmailId);
  if (existingUser) {
    throw new ConflictError("An account with this email already exists");
  }

  // Look up AccountType record
  const accountTypeRecord = await findAccountTypeByName(data.AccountType);
  if (!accountTypeRecord) {
    throw new BadRequestError("Invalid account type specified");
  }

  // Hash password
  const PasswordHash = await bcrypt.hash(data.Password, 10);

  return await prisma.$transaction(async (tx) => {
    // 1. Create Customer
    const customer = await createCustomer(
      {
        FirstName: data.FirstName,
        LastName: data.LastName,
        Address1: data.Address1,
        Address2: data.Address2,
        City: data.City,
        State: data.State,
        Country: data.Country,
        ZIPCode: data.ZIPCode,
        EmailId: data.EmailId,
        Phone: data.Phone,
        Mobile: data.Mobile,
        DOB: new Date(data.DOB),
        MaritalStatus: data.MaritalStatus,
      },
      tx
    );

    // 2. Create User Credentials
    const user = await createUser(
      {
        Email: data.EmailId,
        PasswordHash,
        CustID: customer.CustID,
      },
      tx
    );

    // 3. Create Customer Account Link
    const account = await createAccount(
      {
        CustID: customer.CustID,
        AccountTypeID: accountTypeRecord.AccountTypeID,
      },
      tx
    );

    // 4. Create Product Specific Detail
    if (data.AccountType === "SAVING") {
      const savingAccount = await createSavingAccountDetail(
        {
          AcctNum: account.AcctNum,
          SavingAccountTypeId: accountTypeRecord.AccountTypeID,
          Balance: 0,
          TransferLimit: 100000,
          BranchCode: "BR001",
        },
        tx
      );

      return { customer, account, savingAccount, user: { id: user.UserID, email: user.Email } };
    }

    if (data.AccountType === "LOAN") {
      const loanAccount = await createLoanAccountDetail(
        {
          AcctNum: account.AcctNum,
          BalanceAmount: 0,
          BranchCode: "BR001",
          RateOfInterest: 8.5,
          LoanDuration: 60,
          TotalLoanAmount: 0,
          LoanAccountTypeId: accountTypeRecord.AccountTypeID,
        },
        tx
      );

      return { customer, account, loanAccount, user: { id: user.UserID, email: user.Email } };
    }

    throw new BadRequestError("Unsupported account type specified");
  });
}

// 2. Get Customer Profile by Customer ID
export async function getCustomerProfileByID(custId: string) {
  if (!custId || !custId.trim()) {
    throw new BadRequestError("Customer ID is required");
  }

  const customer = await findCustomerById(custId.trim());
  if (!customer) {
    throw new NotFoundError(`Customer with ID '${custId}' not found`);
  }
  return customer;
}

// Alias export to maintain compatibility across controllers
export const getCustomerProfileById = getCustomerProfileByID;

// 3. Search Customer Profiles (Allows empty query to return all customers)
export async function searchCustomerProfiles(query: {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
}) {
  const sanitizedQuery = {
    firstName: query.firstName?.trim() || undefined,
    lastName: query.lastName?.trim() || undefined,
    email: query.email?.trim() || undefined,
    mobile: query.mobile?.trim() || undefined,
  };

  // ✅ Removed BadRequestError so searching with {} returns all records
  return await searchCustomers(sanitizedQuery);
}

// 4. Update Customer Profile
export async function updateCustomerProfile(
  custId: string,
  updateData: {
    FirstName?: string;
    LastName?: string;
    Address1?: string;
    Address2?: string;
    City?: string;
    State?: string;
    Country?: string;
    ZIPCode?: string;
    EmailId?: string;
    Phone?: string;
    Mobile?: string;
    MaritalStatus?: string;
  }
) {
  if (!custId || !custId.trim()) {
    throw new BadRequestError("Customer ID is required");
  }

  // 1. Verify customer exists
  const existingCustomer = await getCustomerProfileByID(custId.trim());

  // 2. Prevent empty updates
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new BadRequestError("No update fields provided");
  }

  // 3. Handle Email Uniqueness Check during update
  if (updateData.EmailId && updateData.EmailId !== existingCustomer.EmailId) {
    const duplicateCheck = await searchCustomers({ email: updateData.EmailId.trim() });
    const isDuplicate = duplicateCheck.some((c) => c.CustID !== custId.trim());

    if (isDuplicate) {
      throw new ConflictError("An account with this email address already exists");
    }
  }

  return await updateCustomer(custId.trim(), updateData);
}

// 5. Delete Customer Profile (Admin / Clean Cascade)
export async function deleteCustomerProfile(custId: string) {
  if (!custId || !custId.trim()) {
    throw new BadRequestError("Customer ID is required");
  }

  // 1. Verify customer exists first
  await getCustomerProfileByID(custId.trim());

  // 2. Perform deletion (Prisma cascading removes linked accounts, transactions, KYC, and User)
  await deleteCustomer(custId.trim());

  return {
    success: true,
    message: `Customer ${custId.trim()} and associated accounts deleted successfully`,
  };
}

export async function getCustomerProfileWithKYC(custId: string) {
  return await prisma.customerDetail.findUnique({
    where: { CustID: custId },
    include: {
      Accounts: {
        include: {
          AccountType: true,
          SavingAccount: true,
          LoanAccount: true,
        },
      },
      KYCDetail: true, // 👈 Crucial: This populates the customer's KYC status
    },
  });
}