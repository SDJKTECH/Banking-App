import { Request, Response, NextFunction } from "express";
import {
  withdrawMoney,
  transferMoney,
  depositMoney
} from "../services/transaction.service";
import { getSavingTxnHistoryByAcctNum } from "../repository/transaction.repository";

// POST /api/transactions/withdraw
export async function withdrawController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { AcctNum, Amount, Remarks } = req.body;

    const result = await withdrawMoney({
      AcctNum: String(AcctNum),
      Amount: Number(Amount),
      Remarks,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Withdrawal completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/transactions/transfer
export async function transferController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { SourceAcctNum, DestinationAcctNum, Amount, Remarks } = req.body;

    const result = await transferMoney({
      SourceAcctNum: String(SourceAcctNum),
      DestinationAcctNum: String(DestinationAcctNum),
      Amount: Number(Amount),
      Remarks,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Funds transferred successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/transactions/:acctNum
export async function getTransactionHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const acctNum = req.params.acctNum as string;
    const type = req.query.type as "DEPOSIT" | "WITHDRAW" | "ALL" | undefined;

    const history = await getSavingTxnHistoryByAcctNum(acctNum, type);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Transaction history retrieved successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/transactions/deposit
export async function depositController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { AcctNum, Amount, Remarks } = req.body;

    const result = await depositMoney({
      AcctNum: String(AcctNum),
      Amount: Number(Amount),
      Remarks,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Deposit completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}