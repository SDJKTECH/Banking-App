// src/services/customer.teller.service.ts
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { AccountTypeName } from "../generated/prisma";
import { generateRandomPassword } from "../lib/password";
import { sendWelcomeCredentialsEmail } from "../lib/mailer";
import {
  createCustomerByTeller,
  advanceSearchCustomers,
} from "../repository/customer.teller.repository";
import {
  findCustomerById,
  updateCustomer,
  deleteCustomer,
  findAllCustomersWithKYC,
} from "../repository/customer.repository";
import {
  createAccount,
  createSavingAccountDetail,
  findAccountTypeByName,
} from "../repository/account.repository";
import { createLoanAccount } from "../repository/loan.teller.repository";
import { createUser, findUserByEmail } from "../repository/auth.repository";
import { BadRequestError, ConflictError, NotFoundError } from "../errors/AppError";

// 1. Onboard Customer by Teller
export async function onboardCustomerByTeller(data: {
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
  BranchCode?: string;
  IFSCCode?: string;
  InitialDeposit?: number;
}) {
  const existingUser = await findUserByEmail(data.EmailId);
  if (existingUser) {
    throw new ConflictError("An account with this email address already exists");
  }

  const accountTypeRecord = await findAccountTypeByName(data.AccountType);
  if (!accountTypeRecord) {
    throw new BadRequestError(`Account type '${data.AccountType}' does not exist`);
  }

  const tempPassword = generateRandomPassword(10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const branchCode = data.BranchCode || "BR001";
  const ifscCode = data.IFSCCode || "JKBK0000001";
  const initialBal = Number(data.InitialDeposit) || 0;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Customer Detail
    const customer = await createCustomerByTeller(
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

    // 2. Create User Account Credentials
    const user = await createUser(
      {
        Email: data.EmailId,
        PasswordHash: passwordHash,
        CustID: customer.CustID,
      },
      tx
    );

    // 3. Create Base Account
    const account = await createAccount(
      {
        CustID: customer.CustID,
        AccountTypeID: accountTypeRecord.AccountTypeID,
      },
      tx
    );

    // 4. Create Saving or Loan sub-account
    let savingAccount = null;
    let loanAccount = null;

    if (data.AccountType === "SAVING") {
      savingAccount = await createSavingAccountDetail(
        {
          AcctNum: account.AcctNum,
          SavingAccountTypeId: accountTypeRecord.AccountTypeID,
          Balance: initialBal,
          TransferLimit: 100000,
          BranchCode: branchCode,
        },
        tx
      );
    } else if (data.AccountType === "LOAN") {
      loanAccount = await createLoanAccount(
        {
          AcctNum: account.AcctNum,
          TotalLoanAmount: 0,
          BalanceAmount: 0,
          BranchCode: branchCode,
          IFSCCode: ifscCode,
          RateOfInterest: 8.5,
          LoanDuration: 60,
          LoanAccountTypeId: accountTypeRecord.AccountTypeID,
        },
        tx
      );
    }

    return { customer, user, account: { ...account, SavingAccount: savingAccount, LoanAccount: loanAccount } };
  });

  try {
    await sendWelcomeCredentialsEmail({
      toEmail: data.EmailId,
      customerName: `${data.FirstName} ${data.LastName}`,
      custId: result.customer.CustID,
      tempPassword,
      accountNumber: result.account.AcctNum,
      accountType: data.AccountType,
    });
  } catch (err) {
    console.error("Email delivery failed:", err);
  }

  return result;
}

// 2. Search Customers (Forward search criteria, name, and pagination)
export async function advanceSearchCustomersService(filters: {
  custId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  page?: number;
  pageSize?: number;
}) {
  return await advanceSearchCustomers(filters);
}

// 3. Update Customer Profile
export async function updateCustomerByTeller(custId: string, updateData: any) {
  const existing = await findCustomerById(custId);
  if (!existing) throw new NotFoundError(`Customer '${custId}' not found`);

  return await updateCustomer(custId, updateData);
}

// 4. Delete Customer Profile
export async function deleteCustomerByTeller(custId: string) {
  const existing = await findCustomerById(custId);
  if (!existing) throw new NotFoundError(`Customer '${custId}' not found`);

  await deleteCustomer(custId);
  return { message: `Customer ${custId} deleted successfully` };
}

// 5. Create Additional Account for Existing Customer
export async function createAdditionalAccountByTeller(data: {
  CustID: string;
  AccountType: AccountTypeName;
  InitialDeposit?: number;
  BranchCode?: string;
  IFSCCode?: string;
}) {
  const customer = await findCustomerById(data.CustID);
  if (!customer) throw new NotFoundError(`Customer '${data.CustID}' not found`);

  const accountTypeRecord = await findAccountTypeByName(data.AccountType);
  if (!accountTypeRecord) {
    throw new BadRequestError(`Account type '${data.AccountType}' does not exist`);
  }

  const branchCode = data.BranchCode || "BR001";
  const ifscCode = data.IFSCCode || "JKBK0000001";
  const initialBal = Number(data.InitialDeposit) || 0;

  return await prisma.$transaction(async (tx) => {
    const account = await createAccount(
      {
        CustID: data.CustID,
        AccountTypeID: accountTypeRecord.AccountTypeID,
      },
      tx
    );

    let savingAccount = null;
    let loanAccount = null;

    if (data.AccountType === "SAVING") {
      savingAccount = await createSavingAccountDetail(
        {
          AcctNum: account.AcctNum,
          SavingAccountTypeId: accountTypeRecord.AccountTypeID,
          Balance: initialBal,
          TransferLimit: 100000,
          BranchCode: branchCode,
        },
        tx
      );
    } else if (data.AccountType === "LOAN") {
      loanAccount = await createLoanAccount(
        {
          AcctNum: account.AcctNum,
          TotalLoanAmount: 0,
          BalanceAmount: 0,
          BranchCode: branchCode,
          IFSCCode: ifscCode,
          RateOfInterest: 8.5,
          LoanDuration: 60,
          LoanAccountTypeId: accountTypeRecord.AccountTypeID,
        },
        tx
      );
    }

    return { account: { ...account, SavingAccount: savingAccount, LoanAccount: loanAccount } };
  });
}

// 6. Close Account by Teller (Single definition with zero-balance validation)
export async function closeAccountByTeller(acctNum: string) {
  return await prisma.$transaction(async (tx) => {
    const account = await tx.customerAccount.findUnique({
      where: { AcctNum: acctNum },
      include: {
        SavingAccount: true,
        LoanAccount: true,
      },
    });

    if (!account) {
      throw new NotFoundError(`Account '${acctNum}' not found`);
    }

    if (account.Status === "CLOSED") {
      throw new BadRequestError("This account has already been closed.");
    }

    if (account.SavingAccount) {
      const balance = Number(account.SavingAccount.Balance);
      if (balance > 0) {
        throw new BadRequestError(
          `Cannot close account. Balance of ₹${balance.toLocaleString("en-IN")} must be fully withdrawn or transferred first.`
        );
      }
    }

    if (account.LoanAccount) {
      const balance = Number(account.LoanAccount.BalanceAmount);
      if (balance > 0) {
        throw new BadRequestError(
          `Cannot close loan account. Outstanding balance of ₹${balance.toLocaleString("en-IN")} must be settled first.`
        );
      }
    }

    return await tx.customerAccount.update({
      where: { AcctNum: acctNum },
      data: { Status: "CLOSED" },
    });
  });
}

export async function getTellerCustomerDirectory() {
  return await findAllCustomersWithKYC();
}