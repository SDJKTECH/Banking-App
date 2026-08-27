// src/repository/customer.teller.repository.ts
import { prisma } from "../config/prisma";
import { Prisma, AccountStatus } from "../generated/prisma";
import { generateCustomerId } from "./auth.repository";

type DBClient = Prisma.TransactionClient | typeof prisma;

export async function createCustomerByTeller(
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

export async function advanceSearchCustomers(
  filters: {
    custId?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    page?: number;
    pageSize?: number;
  },
  db: DBClient = prisma
) {
  const andConditions: Prisma.CustomerDetailWhereInput[] = [];

  if (filters.custId && filters.custId.trim()) {
    andConditions.push({
      CustID: { contains: filters.custId.trim(), mode: "insensitive" },
    });
  }

  // Handle name searches
  const searchTerm = (filters.name || filters.firstName || filters.lastName || "").trim();

  if (filters.firstName && filters.lastName) {
    andConditions.push({
      FirstName: { contains: filters.firstName.trim(), mode: "insensitive" },
    });
    andConditions.push({
      LastName: { contains: filters.lastName.trim(), mode: "insensitive" },
    });
  } else if (searchTerm) {
    const parts = searchTerm.split(/\s+/);
    if (parts.length > 1) {
      // Full name search (e.g., "Aitijhya Modak")
      andConditions.push({
        FirstName: { contains: parts[0], mode: "insensitive" },
      });
      andConditions.push({
        LastName: { contains: parts.slice(1).join(" "), mode: "insensitive" },
      });
    } else {
      // Single word query: checks both FirstName and LastName
      andConditions.push({
        OR: [
          { FirstName: { contains: searchTerm, mode: "insensitive" } },
          { LastName: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }
  }

  if (filters.email && filters.email.trim()) {
    andConditions.push({
      EmailId: { contains: filters.email.trim(), mode: "insensitive" },
    });
  }

  if (filters.mobile && filters.mobile.trim()) {
    andConditions.push({
      Mobile: { contains: filters.mobile.trim() },
    });
  }

  const where: Prisma.CustomerDetailWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Pagination bounds
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Number(filters.pageSize) || 10);
  const skip = (page - 1) * pageSize;

  // Run count and paginated query concurrently
  const [totalCount, customers] = await Promise.all([
    db.customerDetail.count({ where }),
    db.customerDetail.findMany({
      where,
      skip,
      take: pageSize,
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
      orderBy: [
        { FirstName: "asc" },
        { LastName: "asc" },
      ],
    }),
  ]);

  return {
    customers,
    pagination: {
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    },
  };
}

export async function closeCustomerAccountInDB(
  acctNum: string,
  status: AccountStatus = "CLOSED",
  db: DBClient = prisma
) {
  return db.customerAccount.update({
    where: { AcctNum: acctNum },
    data: { Status: status },
  });
}