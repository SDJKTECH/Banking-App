// src/services/transaction.teller.service.ts
import { prisma } from "../config/prisma";
import {
  findSavingAccountByAcctNum,
  updateSavingAccountBalance,
} from "../repository/transaction.repository";
import {
  createAuditedTxnEntry,
  fetchStatementsByFilter,
} from "../repository/transaction.teller.repository";
import { BadRequestError, NotFoundError } from "../errors/AppError";

// 1. Teller Deposit Money
export async function tellerDepositMoney(data: {
  AcctNum: string;
  Amount: number;
  Remarks?: string;
}) {
  if (data.Amount <= 0) {
    throw new BadRequestError("Deposit amount must be greater than zero");
  }

  return await prisma.$transaction(async (tx) => {
    const baseAccount = await tx.customerAccount.findUnique({ where: { AcctNum: data.AcctNum } });
    if (!baseAccount || baseAccount.Status === "CLOSED") {
      throw new BadRequestError("Transactions are prohibited on closed accounts.");
    }

    const account = await findSavingAccountByAcctNum(data.AcctNum, tx);
    if (!account) throw new NotFoundError(`Account ${data.AcctNum} not found`);

    const newBalance = Number(account.Balance) + data.Amount;
    await updateSavingAccountBalance(data.AcctNum, newBalance, tx);

    const transaction = await createAuditedTxnEntry(
      {
        AcctNum: data.AcctNum,
        DepositAmount: data.Amount,
        Balance: newBalance,
        TxnDetail: data.Remarks || "Counter Cash Deposit by Teller",
      },
      tx
    );

    return { acctNum: data.AcctNum, deposited: data.Amount, balance: newBalance, transactionId: transaction.TxnID };
  });
}

// 2. Teller Withdraw Money
export async function tellerWithdrawMoney(data: {
  AcctNum: string;
  Amount: number;
  Remarks?: string;
}) {
  if (data.Amount <= 0) {
    throw new BadRequestError("Withdrawal amount must be greater than zero");
  }

  return await prisma.$transaction(async (tx) => {
    const baseAccount = await tx.customerAccount.findUnique({ where: { AcctNum: data.AcctNum } });
    if (!baseAccount || baseAccount.Status === "CLOSED") {
      throw new BadRequestError("Transactions are prohibited on closed accounts.");
    }

    const account = await findSavingAccountByAcctNum(data.AcctNum, tx);
    if (!account) throw new NotFoundError(`Account ${data.AcctNum} not found`);

    const currentBal = Number(account.Balance);
    if (currentBal < data.Amount) {
      throw new BadRequestError(`Insufficient funds. Available balance: ₹${currentBal.toLocaleString("en-IN")}`);
    }

    const newBalance = currentBal - data.Amount;
    await updateSavingAccountBalance(data.AcctNum, newBalance, tx);

    const transaction = await createAuditedTxnEntry(
      {
        AcctNum: data.AcctNum,
        WithdrawAmount: data.Amount,
        Balance: newBalance,
        TxnDetail: data.Remarks || "Counter Cash Withdrawal by Teller",
      },
      tx
    );

    return { acctNum: data.AcctNum, withdrawn: data.Amount, balance: newBalance, transactionId: transaction.TxnID };
  });
}

// 3. Teller Transfer Money
export async function tellerTransferMoney(data: {
  SourceAcctNum: string;
  DestinationAcctNum: string;
  Amount: number;
  Remarks?: string;
}) {
  const cleanSource = String(data.SourceAcctNum || "").replace(/\s+/g, "").trim();
  const cleanDest = String(data.DestinationAcctNum || "").replace(/\s+/g, "").trim();
  const amount = Number(data.Amount);

  if (!cleanSource || !cleanDest) {
    throw new BadRequestError("Source and Destination account numbers are required");
  }

  if (amount <= 0) {
    throw new BadRequestError("Transfer amount must be greater than zero");
  }

  if (cleanSource === cleanDest) {
    throw new BadRequestError("Source and Destination accounts cannot be identical");
  }

  return await prisma.$transaction(async (tx) => {
    const [sourceBase, destBase] = await Promise.all([
      tx.customerAccount.findUnique({ where: { AcctNum: cleanSource } }),
      tx.customerAccount.findUnique({ where: { AcctNum: cleanDest } }),
    ]);

    if (!sourceBase || sourceBase.Status === "CLOSED") {
      throw new BadRequestError(`Source account '${cleanSource}' is closed or does not exist.`);
    }
    if (!destBase || destBase.Status === "CLOSED") {
      throw new BadRequestError(`Destination account '${cleanDest}' is closed or does not exist.`);
    }

    const [source, dest] = await Promise.all([
      findSavingAccountByAcctNum(cleanSource, tx),
      findSavingAccountByAcctNum(cleanDest, tx),
    ]);

    if (!source) throw new NotFoundError(`Source savings account ${cleanSource} not found`);
    if (!dest) throw new NotFoundError(`Destination savings account ${cleanDest} not found`);

    const sourceBal = Number(source.Balance);
    if (sourceBal < amount) {
      throw new BadRequestError(
        `Insufficient funds in source account. Available balance: ₹${sourceBal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
      );
    }

    const newSourceBal = Number((sourceBal - amount).toFixed(2));
    const newDestBal = Number((Number(dest.Balance) + amount).toFixed(2));

    await Promise.all([
      updateSavingAccountBalance(cleanSource, newSourceBal, tx),
      updateSavingAccountBalance(cleanDest, newDestBal, tx),
    ]);

    const debitTxn = await createAuditedTxnEntry(
      {
        AcctNum: cleanSource,
        WithdrawAmount: amount,
        Balance: newSourceBal,
        TxnDetail: data.Remarks || `Teller Transfer to ${cleanDest}`,
      },
      tx
    );

    const creditTxn = await createAuditedTxnEntry(
      {
        AcctNum: cleanDest,
        DepositAmount: amount,
        Balance: newDestBal,
        TxnDetail: data.Remarks || `Teller Transfer from ${cleanSource}`,
      },
      tx
    );

    return {
      sourceAccount: cleanSource,
      destinationAccount: cleanDest,
      amount: amount,
      sourceBalance: newSourceBal,
      destinationBalance: newDestBal,
      debitTxnId: debitTxn.TxnID,
      creditTxnId: creditTxn.TxnID,
    };
  });
}

// 4. Statements / Audit Query (Paginated)
export async function getTellerStatements(filter: {
  acctNum?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
  txnType?: "DEPOSIT" | "WITHDRAW";
  page?: number;
  pageSize?: number;
}) {
  return await fetchStatementsByFilter({
    acctNum: filter.acctNum,
    limit: filter.limit,
    startDate: filter.startDate ? new Date(filter.startDate) : undefined,
    endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    txnType: filter.txnType,
    page: filter.page,
    pageSize: filter.pageSize,
  });
}