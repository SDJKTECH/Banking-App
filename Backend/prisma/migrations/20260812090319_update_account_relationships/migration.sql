/*
  Warnings:

  - You are about to drop the column `EMIID` on the `LoanAccountDetail` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LoanAccountDetail_EMIID_key";

-- AlterTable
ALTER TABLE "LoanAccountDetail" DROP COLUMN "EMIID";

-- CreateTable
CREATE TABLE "CardDetail" (
    "CardID" TEXT NOT NULL,
    "AcctNum" TEXT NOT NULL,
    "CardNumberHash" TEXT NOT NULL,
    "CardType" TEXT NOT NULL,
    "ExpiryDate" TIMESTAMP(3) NOT NULL,
    "CardStatus" TEXT NOT NULL,

    CONSTRAINT "CardDetail_pkey" PRIMARY KEY ("CardID")
);

-- CreateTable
CREATE TABLE "SavingAccountTxnHistory" (
    "TxnID" TEXT NOT NULL,
    "TxnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AcctNum" TEXT NOT NULL,
    "TxnDetail" TEXT,
    "WithdrawAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "DepositAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "Balance" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "SavingAccountTxnHistory_pkey" PRIMARY KEY ("TxnID")
);

-- CreateTable
CREATE TABLE "LoanEMIDetail" (
    "EMIID" TEXT NOT NULL,
    "AcctNum" TEXT NOT NULL,
    "EMIDate" TIMESTAMP(3) NOT NULL,
    "EMIAmount" DECIMAL(18,2) NOT NULL,
    "EMIStatus" TEXT NOT NULL,
    "EMIReminder" TIMESTAMP(3),
    "RemainingBalance" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "LoanEMIDetail_pkey" PRIMARY KEY ("EMIID")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardDetail_CardNumberHash_key" ON "CardDetail"("CardNumberHash");

-- CreateIndex
CREATE INDEX "CardDetail_AcctNum_idx" ON "CardDetail"("AcctNum");

-- CreateIndex
CREATE INDEX "CardDetail_CardStatus_idx" ON "CardDetail"("CardStatus");

-- CreateIndex
CREATE INDEX "SavingAccountTxnHistory_AcctNum_idx" ON "SavingAccountTxnHistory"("AcctNum");

-- CreateIndex
CREATE INDEX "SavingAccountTxnHistory_TxnDate_idx" ON "SavingAccountTxnHistory"("TxnDate");

-- CreateIndex
CREATE INDEX "LoanEMIDetail_AcctNum_idx" ON "LoanEMIDetail"("AcctNum");

-- CreateIndex
CREATE INDEX "LoanEMIDetail_EMIDate_idx" ON "LoanEMIDetail"("EMIDate");

-- AddForeignKey
ALTER TABLE "CardDetail" ADD CONSTRAINT "CardDetail_AcctNum_fkey" FOREIGN KEY ("AcctNum") REFERENCES "SavingAccountDetail"("AcctNum") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingAccountTxnHistory" ADD CONSTRAINT "SavingAccountTxnHistory_AcctNum_fkey" FOREIGN KEY ("AcctNum") REFERENCES "SavingAccountDetail"("AcctNum") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanEMIDetail" ADD CONSTRAINT "LoanEMIDetail_AcctNum_fkey" FOREIGN KEY ("AcctNum") REFERENCES "LoanAccountDetail"("AcctNum") ON DELETE CASCADE ON UPDATE CASCADE;
