import { prisma } from "../config/prisma";
import { Prisma,AccountTypeName } from "../generated/prisma";
import { randomUUID } from "node:crypto";
import { generateAccountNumber } from "./auth.repository";

// Accept any transaction client or base Prisma client
type DBClient = Prisma.TransactionClient | typeof prisma;

// Find Account Type By Name
export async function findAccountTypeByName(
    accountType: AccountTypeName,
    db: DBClient = prisma
) {
    return db.accountType.findFirst({
        where: {
            AccountType: accountType,
        },
    });
}



// Create Account
export async function createAccount(
    data: {
        CustID: string;
        AccountTypeID: number;
    },
    db: DBClient = prisma
) {
    const AcctNum = await generateAccountNumber(db);

    return db.customerAccount.create({
        data: {
            CustID: data.CustID,
            AcctNum,
            AccountTypeID: data.AccountTypeID,
        },
    });
}

// Create Saving Account Detail
export async function createSavingAccountDetail(
    data: {
        AcctNum: string;
        SavingAccountTypeId: number;
        Balance: number;
        TransferLimit: number;
        BranchCode: string;
    },
    db: DBClient = prisma
) {
    return db.savingAccountDetail.create({
        data: {
            AcctNum: data.AcctNum,
            SavingAccountTypeId: data.SavingAccountTypeId,
            Balance: data.Balance,
            TransferLimit: data.TransferLimit,
            BranchCode: data.BranchCode,
        },
    });
}

// Create Loan Account Detail
export async function createLoanAccountDetail(
    data: {
        AcctNum: string;
        BalanceAmount: number;
        BranchCode: string;
        RateOfInterest: number;
        LoanDuration: number;
        TotalLoanAmount: number;
        LoanAccountTypeId: number;
    },
    db: DBClient = prisma
) {
    return db.loanAccountDetail.create({
        data: {
            AcctNum: data.AcctNum,
            BalanceAmount: data.BalanceAmount,
            BranchCode: data.BranchCode,
            RateOfInterest: data.RateOfInterest,
            LoanDuration: data.LoanDuration,
            TotalLoanAmount: data.TotalLoanAmount,
            LoanAccountTypeId: data.LoanAccountTypeId,
        },
    });
}


