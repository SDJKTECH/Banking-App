import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";
import { randomUUID } from "node:crypto";

type DBClient = Prisma.TransactionClient | typeof prisma;

// Find savings account by account number
export async function findSavingAccountByAcctNum(
  acctNum: string,
  db: DBClient = prisma
) {
  return db.savingAccountDetail.findUnique({
    where: { AcctNum: acctNum },
    include: {
      Account: {
        include: {
          Customer: true,
        },
      },
    },
  });
}

// Update saving account balance
export async function updateSavingAccountBalance(
  acctNum: string,
  newBalance: number,
  db: DBClient = prisma
) {
  return db.savingAccountDetail.update({
    where: { AcctNum: acctNum },
    data: {
      Balance: newBalance,
    },
  });
}

// Create transaction history entry matching SavingAccountTxnHistory model
export async function createSavingTxnHistory(
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

// Get transaction history for an account
export async function getSavingTxnHistoryByAcctNum(
  acctNum: string,
  type?: "DEPOSIT" | "WITHDRAW" | "ALL",
  db: DBClient = prisma
) {
  return db.savingAccountTxnHistory.findMany({
    where: {
      AcctNum: acctNum,
      ...(type === "DEPOSIT" ? { DepositAmount: { gt: 0 } } : {}),
      ...(type === "WITHDRAW" ? { WithdrawAmount: { gt: 0 } } : {}),
    },
    orderBy: {
      TxnDate: "desc",
    },
  });
}

// Create a deposit transaction entry matching SavingAccountTxnHistory model
export async function createDepositTxnHistory(
  data: {
    AcctNum: string;
    DepositAmount: number;
    Balance: number;
    TxnDetail?: string;
  },
  db: DBClient = prisma
) {
  return db.savingAccountTxnHistory.create({
    data: {
      TxnID: `TXN-${randomUUID()}`,
      AcctNum: data.AcctNum,
      WithdrawAmount: 0,
      DepositAmount: data.DepositAmount,
      Balance: data.Balance,
      TxnDetail: data.TxnDetail || "Cash Deposit",
      TxnDate: new Date(),
    },
  });
}