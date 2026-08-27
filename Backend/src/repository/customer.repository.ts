import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";
import { generateCustomerId } from "./auth.repository";

// Accept any transaction client or base Prisma client
type DBClient = Prisma.TransactionClient | typeof prisma;

export async function createCustomer(
  data: {
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
    DOB: Date;
    MaritalStatus?: string;
  },
  db: DBClient = prisma
) {
  const CustID = generateCustomerId();

  return db.customerDetail.create({
    data: {
      CustID,
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
      DOB: data.DOB,
      MaritalStatus: data.MaritalStatus,
    },
  });
}

// Search by custId (Full details including Accounts, KYC, and non-sensitive User metadata)
export async function findCustomerById(
  custId: string,
  db: DBClient = prisma
) {
  return db.customerDetail.findUnique({
    where: { CustID: custId },
    include: {
      Accounts: {
        include: {
          AccountType: true,
          SavingAccount: true,
          LoanAccount: true,
        },
      },
      KYC: true,
      User: {
        select: {
          UserID: true,
          Email: true,
          Role: true,
          CreatedAt: true,
        },
      },
    },
  });
}

// Customer Advance Search (Includes complete account and KYC info for search results)
export async function searchCustomers(
  filters: {
    firstName?: string;
    lastName?: string;
    mobile?: string;
    email?: string;
  },
  db: DBClient = prisma
) {
  const whereClause: Prisma.CustomerDetailWhereInput = {
    User: {
      Role: {
        notIn: ["ADMIN", "BANK_TELLER"],
      },
    },
  };

  if (filters.firstName) {
    whereClause.FirstName = { contains: filters.firstName, mode: "insensitive" };
  }
  if (filters.lastName) {
    whereClause.LastName = { contains: filters.lastName, mode: "insensitive" };
  }
  if (filters.mobile) {
    whereClause.Mobile = { contains: filters.mobile };
  }
  if (filters.email) {
    whereClause.EmailId = { contains: filters.email, mode: "insensitive" };
  }

  return db.customerDetail.findMany({
    where: whereClause,
    include: {
      Accounts: {
        include: {
          AccountType: true,
          SavingAccount: true,
          LoanAccount: true,
        },
      },
      KYC: true,
    },
    orderBy: [
      { FirstName: "asc" },
      { LastName: "asc" },
    ],
  });
}

// Backward-compatible alias if imported as searchCustomer
export const searchCustomer = searchCustomers;

// Update Customer Profile
export async function updateCustomer(
  custId: string,
  data: Prisma.CustomerDetailUpdateInput,
  db: DBClient = prisma
) {
  return db.customerDetail.update({
    where: { CustID: custId },
    data,
    include: {
      Accounts: {
        include: {
          AccountType: true,
          SavingAccount: true,
          LoanAccount: true,
        },
      },
      KYC: true,
    },
  });
}

// Delete Customer Record (Cascade automatically removes linked User, Accounts, Cards, and KYC)
export async function deleteCustomer(
  custId: string,
  db: DBClient = prisma
) {
  return db.customerDetail.delete({
    where: { CustID: custId },
  });
}

export async function findCustomerByUserId(
  userId: string,
  db: DBClient = prisma
) {
  return db.customerDetail.findFirst({
    where: { User: { UserID: userId } }, // or { UserId: userId } depending on exact field schema
    include: {
      Accounts: {
        include: {
          AccountType: true,
          SavingAccount: true,
          LoanAccount: true,
        },
      },
      KYC: true,
    },
  });
}

export async function findAllCustomersWithKYC(db: DBClient = prisma) {
  return db.customerDetail.findMany({
    where : {
      User:{
        Role:{
          notIn:["ADMIN","BANK_TELLER"]
        },
      },
    },
    include: {
      Accounts: {
        include: {
          AccountType: true,
          SavingAccount: true,
          LoanAccount: true,
        },
      },
      KYC: true, // 👈 Essential for checking unapplied or pending status
      User: {
        select: {
          UserID: true,
          Email: true,
          Role: true,
          CreatedAt: true,
        },
      },
    },
    orderBy: [
      { FirstName: "asc" },
      { LastName: "asc" },
    ],
  });
}