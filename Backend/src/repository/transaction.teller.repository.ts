// src/repository/transaction.teller.repository.ts
import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";
import { randomUUID } from "node:crypto";

type DBClient = Prisma.TransactionClient | typeof prisma;

export async function createAuditedTxnEntry(
  data: {
    AcctNum: string;
    WithdrawAmount?: number;
    DepositAmount?: number;
    Balance: number;
    TxnDetail?: string;
  },
  db: DBClient = prisma
) {
  return db.savingAccountTxnHistory.create({
    data: {
      TxnID: `TXN-${randomUUID()}`,
      AcctNum: data.AcctNum,
      WithdrawAmount: data.WithdrawAmount ?? 0,
      DepositAmount: data.DepositAmount ?? 0,
      Balance: data.Balance,
      TxnDetail: data.TxnDetail || null,
      TxnDate: new Date(),
    },
  });
}

export async function fetchStatementsByFilter(
  filter: {
    acctNum?: string;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    txnType?: "DEPOSIT" | "WITHDRAW";
    page?: number;
    pageSize?: number;
  },
  db: DBClient = prisma
) {
  const where: Prisma.SavingAccountTxnHistoryWhereInput = {};

  if (filter.acctNum && filter.acctNum.trim()) {
    where.AcctNum = { contains: filter.acctNum.trim() };
  }
  if (filter.txnType === "DEPOSIT") {
    where.DepositAmount = { gt: 0 };
  } else if (filter.txnType === "WITHDRAW") {
    where.WithdrawAmount = { gt: 0 };
  }
  if (filter.startDate || filter.endDate) {
    where.TxnDate = {};
    if (filter.startDate) where.TxnDate.gte = filter.startDate;
    if (filter.endDate) where.TxnDate.lte = filter.endDate;
  }

  const page = Math.max(1, Number(filter.page) || 1);
  const pageSize = filter.limit ? Number(filter.limit) : Math.max(1, Number(filter.pageSize) || 10);
  const skip = (page - 1) * pageSize;

  const [totalCount, statements] = await Promise.all([
    db.savingAccountTxnHistory.count({ where }),
    db.savingAccountTxnHistory.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { TxnDate: "desc" },
      include: {
        Account: {
          include: {
            Account: {
              include: {
                Customer: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    statements,
    pagination: {
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    },
  };
}