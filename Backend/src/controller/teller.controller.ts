// src/controller/teller.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  onboardCustomerByTeller,
  advanceSearchCustomersService,
  updateCustomerByTeller,
  closeAccountByTeller,
  deleteCustomerByTeller,
  createAdditionalAccountByTeller,
  getTellerCustomerDirectory,
} from "../services/customer.teller.service";
import {
  tellerDepositMoney,
  tellerWithdrawMoney,
  tellerTransferMoney,
  getTellerStatements,
} from "../services/transaction.teller.service";
import {
  grantLoanByTeller,
  payLoanEMIByTeller,
} from "../services/loan.teller.service";
import { findPaginatedUnappliedKYCCustomers } from "../repository/kyc.repository";

// Customer Actions
export async function tellerCreateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await onboardCustomerByTeller(req.body);
    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Customer onboarded and credentials emailed",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerSearchCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      custId: req.query.custId as string | undefined,
      name: req.query.name as string | undefined,
      firstName: req.query.firstName as string | undefined,
      lastName: req.query.lastName as string | undefined,
      email: req.query.email as string | undefined,
      mobile: req.query.mobile as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
    };
    const result = await advanceSearchCustomersService(filters);
    return res.status(200).json({ statusCode: 200, success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function tellerUpdateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const custId = req.params.custId as string;
    const result = await updateCustomerByTeller(custId, req.body);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Customer updated",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerCloseAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const acctNum = req.params.acctNum as string;
    const result = await closeAccountByTeller(acctNum);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Account closed",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerDeleteCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const custId = req.params.custId as string;
    const result = await deleteCustomerByTeller(custId);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: result.message,
    });
  } catch (e) {
    next(e);
  }
}

// Cash Actions
export async function tellerDeposit(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tellerDepositMoney(req.body);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Deposit completed",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerWithdraw(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tellerWithdrawMoney(req.body);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Withdrawal completed",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerTransfer(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tellerTransferMoney(req.body);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Transfer completed",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

// Statements (Paginated Audit Query)
export async function tellerStatements(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      acctNum: req.query.acctNum as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      txnType: req.query.txnType as "DEPOSIT" | "WITHDRAW" | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
    };
    const result = await getTellerStatements(filters);
    return res.status(200).json({ statusCode: 200, success: true, data: result });
  } catch (e) {
    next(e);
  }
}

// Loan Actions
export async function tellerGrantLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await grantLoanByTeller(req.body);
    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Loan granted successfully",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerPayEMI(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await payLoanEMIByTeller(req.body);
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "EMI received",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerCreateAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await createAdditionalAccountByTeller(req.body);
    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Additional account created and linked successfully",
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export async function tellerGetCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const customers = await getTellerCustomerDirectory();
    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
}

// 🛡️ KYC Compliance: Paginated Non-KYC / Unapplied Customers
export async function tellerGetUnappliedKYCCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
    const search = req.query.search as string | undefined;

    const result = await findPaginatedUnappliedKYCCustomers({
      page,
      pageSize,
      search,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}