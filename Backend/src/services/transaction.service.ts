import { prisma } from "../config/prisma";
import {
  findSavingAccountByAcctNum,
  updateSavingAccountBalance,
  createSavingTxnHistory,
} from "../repository/transaction.repository";
import { BadRequestError, NotFoundError } from "../errors/AppError";

// 1. Withdraw Service
export async function withdrawMoney(data: {
  AcctNum: string;
  Amount: number;
  Remarks?: string;
}) {
  if (data.Amount <= 0) {
    throw new BadRequestError("Withdrawal amount must be greater than zero");
  }

  return await prisma.$transaction(async (tx) => {
    const account = await findSavingAccountByAcctNum(data.AcctNum, tx);
    if (!account) {
      throw new NotFoundError(`Savings account '${data.AcctNum}' not found`);
    }

    const currentBalance = Number(account.Balance);
    if (currentBalance < data.Amount) {
      throw new BadRequestError("Insufficient funds for this withdrawal");
    }

    const newBalance = currentBalance - data.Amount;

    // Deduct balance
    await updateSavingAccountBalance(data.AcctNum, newBalance, tx);

    // Record audit trail in history
    const txnRecord = await createSavingTxnHistory(
      {
        AcctNum: data.AcctNum,
        WithdrawAmount: data.Amount,
        DepositAmount: 0,
        Balance: newBalance,
        TxnDetail: data.Remarks || "Cash Withdrawal",
      },
      tx
    );

    return {
      acctNum: data.AcctNum,
      amountWithdrawn: data.Amount,
      remainingBalance: newBalance,
      transaction: txnRecord,
    };
  });
}

// 2. Peer-to-Peer Transfer Service
export async function transferMoney(data: {
  SourceAcctNum: string;
  DestinationAcctNum: string;
  Amount: number;
  Remarks?: string;
}) {
  if (data.Amount <= 0) {
    throw new BadRequestError("Transfer amount must be greater than zero");
  }

  if (data.SourceAcctNum === data.DestinationAcctNum) {
    throw new BadRequestError("Source and destination accounts cannot be identical");
  }

  return await prisma.$transaction(async (tx) => {
    const sourceAccount = await findSavingAccountByAcctNum(data.SourceAcctNum, tx);
    if (!sourceAccount) {
      throw new NotFoundError(`Source account '${data.SourceAcctNum}' not found`);
    }

    const destAccount = await findSavingAccountByAcctNum(data.DestinationAcctNum, tx);
    if (!destAccount) {
      throw new NotFoundError(`Destination account '${data.DestinationAcctNum}' not found`);
    }

    const sourceBalance = Number(sourceAccount.Balance);
    const destBalance = Number(destAccount.Balance);
    const transferLimit = Number(sourceAccount.TransferLimit);

    if (sourceBalance < data.Amount) {
      throw new BadRequestError("Insufficient balance to execute transfer");
    }

    if (transferLimit && data.Amount > transferLimit) {
      throw new BadRequestError(`Transfer exceeds allowed limit of ₹${transferLimit}`);
    }

    const newSourceBalance = sourceBalance - data.Amount;
    const newDestBalance = destBalance + data.Amount;

    // Update balances
    await updateSavingAccountBalance(data.SourceAcctNum, newSourceBalance, tx);
    await updateSavingAccountBalance(data.DestinationAcctNum, newDestBalance, tx);

    // Ledger for Sender (Debit / Withdrawal)
    const sourceTxn = await createSavingTxnHistory(
      {
        AcctNum: data.SourceAcctNum,
        WithdrawAmount: data.Amount,
        DepositAmount: 0,
        Balance: newSourceBalance,
        TxnDetail: data.Remarks || `Transfer to ${data.DestinationAcctNum}`,
      },
      tx
    );

    // Ledger for Receiver (Credit / Deposit)
    const destTxn = await createSavingTxnHistory(
      {
        AcctNum: data.DestinationAcctNum,
        WithdrawAmount: 0,
        DepositAmount: data.Amount,
        Balance: newDestBalance,
        TxnDetail: data.Remarks || `Transfer from ${data.SourceAcctNum}`,
      },
      tx
    );

    return {
      sourceAccount: data.SourceAcctNum,
      destinationAccount: data.DestinationAcctNum,
      amountTransferred: data.Amount,
      sourceClosingBalance: newSourceBalance,
      sourceTransactionId: sourceTxn.TxnID,
      destTransactionId: destTxn.TxnID,
    };
  });
}

// Deposit Service
export async function depositMoney(data: {
  AcctNum: string;
  Amount: number;
  Remarks?: string;
}) {
  if (data.Amount <= 0) {
    throw new BadRequestError("Deposit amount must be greater than zero");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Verify account existence
    const account = await findSavingAccountByAcctNum(data.AcctNum, tx);
    if (!account) {
      throw new NotFoundError(`Savings account '${data.AcctNum}' not found`);
    }

    const currentBalance = Number(account.Balance);
    const newBalance = currentBalance + data.Amount;

    // 2. Update account balance
    await updateSavingAccountBalance(data.AcctNum, newBalance, tx);

    // 3. Create ledger record in SavingAccountTxnHistory
    const txnRecord = await createSavingTxnHistory(
      {
        AcctNum: data.AcctNum,
        WithdrawAmount: 0,
        DepositAmount: data.Amount,
        Balance: newBalance,
        TxnDetail: data.Remarks || "Cash / Online Deposit",
      },
      tx
    );

    return {
      acctNum: data.AcctNum,
      amountDeposited: data.Amount,
      updatedBalance: newBalance,
      transaction: txnRecord,
    };
  });
}