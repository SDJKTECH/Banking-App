import { prisma } from "../config/prisma";
import { generateAccountNumber } from "../repository/auth.repository";
import { findAccountTypeByName } from "../repository/account.repository";
import { findCustomerById } from "../repository/customer.repository";
import {
  createLoanAccount,
  createEMIScheduleEntries,
  updateEMIPaymentStatus,
  updateLoanBalance,
} from "../repository/loan.teller.repository";
import { BadRequestError, NotFoundError } from "../errors/AppError";

export async function grantLoanByTeller(data: {
  CustID: string;
  AcctNum: string; // 👈 Strictly required: 16-digit existing Loan Account Number
  TotalLoanAmount: number;
  RateOfInterest: number;
  LoanDurationMonths: number;
  BranchCode?: string;
  IFSCCode?: string;
}) {
  const cleanCustId = data.CustID?.trim();
  const cleanAcctNum = data.AcctNum?.trim();

  if (!cleanCustId) {
    throw new BadRequestError("Customer ID is required");
  }
  if (!cleanAcctNum || cleanAcctNum.length !== 16) {
    throw new BadRequestError("A valid 16-digit Loan Account Number is required");
  }
  if (data.TotalLoanAmount <= 0) {
    throw new BadRequestError("Loan amount must be greater than zero");
  }
  if (data.LoanDurationMonths <= 0) {
    throw new BadRequestError("Loan duration must be at least 1 month");
  }

  const customer = await findCustomerById(cleanCustId);
  if (!customer) {
    throw new NotFoundError(`Customer '${cleanCustId}' not found`);
  }

  const loanAccountType = await findAccountTypeByName("LOAN");
  if (!loanAccountType) {
    throw new BadRequestError("Loan account type configuration missing");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Verify that the target account exists and belongs to this customer
    const accountRecord = await tx.customerAccount.findUnique({
      where: { AcctNum: cleanAcctNum },
      include: {
        LoanAccount: true,
        AccountType: true,
      },
    });

    if (!accountRecord) {
      throw new NotFoundError(`Loan account '${cleanAcctNum}' does not exist in the system`);
    }

    if (accountRecord.CustID !== cleanCustId) {
      throw new BadRequestError(
        `Account '${cleanAcctNum}' does not belong to Customer '${cleanCustId}'`
      );
    }

    if (accountRecord.AccountType.AccountType !== "LOAN") {
      throw new BadRequestError(
        `Account '${cleanAcctNum}' is a ${accountRecord.AccountType.AccountType} account. Loans can only be granted to LOAN accounts.`
      );
    }

    if (accountRecord.Status === "CLOSED") {
      throw new BadRequestError("Cannot disburse loan to a closed account");
    }

    // 2. Create or update the LoanAccountDetail record
    let loanRecord;
    if (!accountRecord.LoanAccount) {
      loanRecord = await createLoanAccount(
        {
          AcctNum: cleanAcctNum,
          TotalLoanAmount: data.TotalLoanAmount,
          BalanceAmount: data.TotalLoanAmount,
          RateOfInterest: data.RateOfInterest,
          LoanDuration: data.LoanDurationMonths,
          BranchCode: data.BranchCode || "BR001",
          IFSCCode: data.IFSCCode || "JKBK0000001",
          LoanAccountTypeId: loanAccountType.AccountTypeID,
        },
        tx
      );
    } else {
      loanRecord = await tx.loanAccountDetail.update({
        where: { AcctNum: cleanAcctNum },
        data: {
          TotalLoanAmount: Number(accountRecord.LoanAccount.TotalLoanAmount) + data.TotalLoanAmount,
          BalanceAmount: Number(accountRecord.LoanAccount.BalanceAmount) + data.TotalLoanAmount,
          RateOfInterest: data.RateOfInterest,
          LoanDuration: data.LoanDurationMonths,
        },
      });
    }

    // 3. Generate Monthly EMI Repayment Schedule
    const monthlyEMI = Number((data.TotalLoanAmount / data.LoanDurationMonths).toFixed(2));
    const emis = [];
    let remBal = data.TotalLoanAmount;

    for (let i = 1; i <= data.LoanDurationMonths; i++) {
      remBal -= monthlyEMI;
      const emiDate = new Date();
      emiDate.setMonth(emiDate.getMonth() + i);

      emis.push({
        AcctNum: cleanAcctNum,
        EMIAmount: monthlyEMI,
        EMIDate: emiDate,
        RemainingBalance: Math.max(0, Number(remBal.toFixed(2))),
      });
    }

    await createEMIScheduleEntries(emis, tx);

    return {
      account: accountRecord,
      loan: loanRecord,
      monthlyEMI,
      totalInstallments: data.LoanDurationMonths,
    };
  });
}

export async function payLoanEMIByTeller(data: {
  AcctNum: string;
  Amount: number;
  EMIID?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify loan account exists
    const loan = await tx.loanAccountDetail.findUnique({
      where: { AcctNum: data.AcctNum },
    });
    if (!loan) throw new NotFoundError(`Loan account '${data.AcctNum}' not found`);

    // 2. Find the target EMI (either by specific EMIID or the oldest pending EMI)
    let emi = null;

    if (data.EMIID && !data.EMIID.startsWith("COUNTER-")) {
      emi = await tx.loanEMIDetail.findUnique({
        where: { EMIID: data.EMIID },
      });
      if (!emi) throw new NotFoundError("EMI record not found");
    } else {
      // 🔍 Auto-detect the next pending EMI in chronological order
      emi = await tx.loanEMIDetail.findFirst({
        where: {
          AcctNum: data.AcctNum,
          EMIStatus: "PENDING",
        },
        orderBy: {
          EMIDate: "asc",
        },
      });
    }

    if (!emi) {
      throw new BadRequestError("No pending EMI installments found for this loan account.");
    }

    if (emi.EMIStatus === "PAID") {
      throw new BadRequestError("This EMI installment has already been settled.");
    }

    // 3. Mark the EMI installment as PAID
    await updateEMIPaymentStatus(emi.EMIID, "PAID", tx);

    // 4. Reduce loan balance
    const currentBalance = Number(loan.BalanceAmount);
    const newRemainingBalance = Math.max(0, currentBalance - data.Amount);
    await updateLoanBalance(data.AcctNum, newRemainingBalance, tx);

    return {
      acctNum: data.AcctNum,
      emiId: emi.EMIID,
      paidAmount: data.Amount,
      installmentDate: emi.EMIDate,
      remainingLoanBalance: newRemainingBalance,
    };
  });
}