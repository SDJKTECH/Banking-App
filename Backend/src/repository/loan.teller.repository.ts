import { prisma } from "../config/prisma";
import { Prisma, EMIStatus } from "../generated/prisma";
import { randomUUID } from "node:crypto";

type DBClient = Prisma.TransactionClient | typeof prisma;

export async function createLoanAccount(
  data: {
    AcctNum: string;
    TotalLoanAmount: number;
    BalanceAmount: number;
    RateOfInterest: number;
    LoanDuration: number;
    BranchCode?: string;
    IFSCCode?: string;
    LoanAccountTypeId: number;
  },
  db: DBClient = prisma
) {
  return db.loanAccountDetail.create({
    data: {
      AcctNum: data.AcctNum,
      TotalLoanAmount: data.TotalLoanAmount,
      BalanceAmount: data.BalanceAmount,
      RateOfInterest: data.RateOfInterest,
      LoanDuration: data.LoanDuration,
      BranchCode: data.BranchCode || "BR001",
      IFSCCode: data.IFSCCode || "JKBK0000001",
      LoanAccountTypeId: data.LoanAccountTypeId,
    },
  });
}

export async function createEMIScheduleEntries(
  emis: Array<{
    AcctNum: string;
    EMIAmount: number;
    EMIDate: Date;
    RemainingBalance: number;
  }>,
  db: DBClient = prisma
) {
  return db.loanEMIDetail.createMany({
    data: emis.map((e) => ({
      EMIID: `EMI-${randomUUID()}`,
      AcctNum: e.AcctNum,
      EMIAmount: e.EMIAmount,
      EMIDate: e.EMIDate,
      RemainingBalance: e.RemainingBalance,
      EMIStatus: "PENDING" as EMIStatus,
    })),
  });
}

export async function updateEMIPaymentStatus(
  emiId: string,
  status: EMIStatus = "PAID",
  db: DBClient = prisma
) {
  return db.loanEMIDetail.update({
    where: { EMIID: emiId },
    data: { EMIStatus: status },
  });
}

export async function updateLoanBalance(
  acctNum: string,
  newBalance: number,
  db: DBClient = prisma
) {
  return db.loanAccountDetail.update({
    where: { AcctNum: acctNum },
    data: { BalanceAmount: newBalance },
  });
}