-- CreateEnum
CREATE TYPE "AccountTypeName" AS ENUM ('SAVING', 'LOAN');

-- CreateTable
CREATE TABLE "CustomerDetail" (
    "CustID" TEXT NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "Address1" TEXT NOT NULL,
    "Address2" TEXT,
    "EmailId" TEXT NOT NULL,
    "Phone" TEXT,
    "Mobile" TEXT NOT NULL,
    "DOB" TIMESTAMP(3) NOT NULL,
    "MaritalStatus" TEXT,
    "ZIPCode" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerDetail_pkey" PRIMARY KEY ("CustID")
);

-- CreateTable
CREATE TABLE "KYCDetail" (
    "KYCID" TEXT NOT NULL,
    "CustID" TEXT NOT NULL,
    "DocumentType" TEXT NOT NULL,
    "DocumentNumber" TEXT NOT NULL,
    "IssueDate" TIMESTAMP(3) NOT NULL,
    "ExpiryDate" TIMESTAMP(3),
    "VerificationStatus" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCDetail_pkey" PRIMARY KEY ("KYCID")
);

-- CreateTable
CREATE TABLE "AccountType" (
    "AccountTypeID" SERIAL NOT NULL,
    "AccountType" "AccountTypeName" NOT NULL,
    "AccSubType" TEXT,

    CONSTRAINT "AccountType_pkey" PRIMARY KEY ("AccountTypeID")
);

-- CreateTable
CREATE TABLE "CustomerAccounts" (
    "CustID" TEXT NOT NULL,
    "AcctNum" TEXT NOT NULL,
    "AccountTypeID" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAccounts_pkey" PRIMARY KEY ("AcctNum")
);

-- CreateTable
CREATE TABLE "SavingAccountDetail" (
    "AcctNum" TEXT NOT NULL,
    "SavingAccountTypeId" INTEGER NOT NULL,
    "Balance" DECIMAL(18,2) NOT NULL,
    "TransferLimit" DECIMAL(18,2) NOT NULL,
    "BranchCode" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingAccountDetail_pkey" PRIMARY KEY ("AcctNum")
);

-- CreateTable
CREATE TABLE "LoanAccountDetail" (
    "AcctNum" TEXT NOT NULL,
    "EMIID" TEXT,
    "BalanceAmount" DECIMAL(18,2) NOT NULL,
    "BranchCode" TEXT NOT NULL,
    "RateOfInterest" DECIMAL(5,2) NOT NULL,
    "LoanDuration" INTEGER NOT NULL,
    "TotalLoanAmount" DECIMAL(18,2) NOT NULL,
    "LoanAccountTypeId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanAccountDetail_pkey" PRIMARY KEY ("AcctNum")
);

-- CreateTable
CREATE TABLE "PostalCode" (
    "ZIPCode" TEXT NOT NULL,
    "CityCode" TEXT NOT NULL,

    CONSTRAINT "PostalCode_pkey" PRIMARY KEY ("ZIPCode")
);

-- CreateTable
CREATE TABLE "City" (
    "CityCode" TEXT NOT NULL,
    "CityName" TEXT NOT NULL,
    "StateCode" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("CityCode")
);

-- CreateTable
CREATE TABLE "State" (
    "StateCode" TEXT NOT NULL,
    "StateName" TEXT NOT NULL,
    "CountryCode" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("StateCode")
);

-- CreateTable
CREATE TABLE "Country" (
    "CountryCode" TEXT NOT NULL,
    "CountryName" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("CountryCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDetail_EmailId_key" ON "CustomerDetail"("EmailId");

-- CreateIndex
CREATE INDEX "CustomerDetail_LastName_idx" ON "CustomerDetail"("LastName");

-- CreateIndex
CREATE INDEX "CustomerDetail_Mobile_idx" ON "CustomerDetail"("Mobile");

-- CreateIndex
CREATE UNIQUE INDEX "KYCDetail_CustID_key" ON "KYCDetail"("CustID");

-- CreateIndex
CREATE UNIQUE INDEX "KYCDetail_DocumentNumber_key" ON "KYCDetail"("DocumentNumber");

-- CreateIndex
CREATE INDEX "CustomerAccounts_CustID_idx" ON "CustomerAccounts"("CustID");

-- CreateIndex
CREATE INDEX "CustomerAccounts_AccountTypeID_idx" ON "CustomerAccounts"("AccountTypeID");

-- CreateIndex
CREATE INDEX "SavingAccountDetail_SavingAccountTypeId_idx" ON "SavingAccountDetail"("SavingAccountTypeId");

-- CreateIndex
CREATE INDEX "SavingAccountDetail_BranchCode_idx" ON "SavingAccountDetail"("BranchCode");

-- CreateIndex
CREATE UNIQUE INDEX "LoanAccountDetail_EMIID_key" ON "LoanAccountDetail"("EMIID");

-- CreateIndex
CREATE INDEX "LoanAccountDetail_LoanAccountTypeId_idx" ON "LoanAccountDetail"("LoanAccountTypeId");

-- CreateIndex
CREATE INDEX "LoanAccountDetail_BranchCode_idx" ON "LoanAccountDetail"("BranchCode");

-- CreateIndex
CREATE INDEX "PostalCode_CityCode_idx" ON "PostalCode"("CityCode");

-- CreateIndex
CREATE INDEX "City_StateCode_idx" ON "City"("StateCode");

-- CreateIndex
CREATE INDEX "State_CountryCode_idx" ON "State"("CountryCode");

-- AddForeignKey
ALTER TABLE "CustomerDetail" ADD CONSTRAINT "CustomerDetail_ZIPCode_fkey" FOREIGN KEY ("ZIPCode") REFERENCES "PostalCode"("ZIPCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCDetail" ADD CONSTRAINT "KYCDetail_CustID_fkey" FOREIGN KEY ("CustID") REFERENCES "CustomerDetail"("CustID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAccounts" ADD CONSTRAINT "CustomerAccounts_CustID_fkey" FOREIGN KEY ("CustID") REFERENCES "CustomerDetail"("CustID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAccounts" ADD CONSTRAINT "CustomerAccounts_AccountTypeID_fkey" FOREIGN KEY ("AccountTypeID") REFERENCES "AccountType"("AccountTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingAccountDetail" ADD CONSTRAINT "SavingAccountDetail_AcctNum_fkey" FOREIGN KEY ("AcctNum") REFERENCES "CustomerAccounts"("AcctNum") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingAccountDetail" ADD CONSTRAINT "SavingAccountDetail_SavingAccountTypeId_fkey" FOREIGN KEY ("SavingAccountTypeId") REFERENCES "AccountType"("AccountTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccountDetail" ADD CONSTRAINT "LoanAccountDetail_AcctNum_fkey" FOREIGN KEY ("AcctNum") REFERENCES "CustomerAccounts"("AcctNum") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanAccountDetail" ADD CONSTRAINT "LoanAccountDetail_LoanAccountTypeId_fkey" FOREIGN KEY ("LoanAccountTypeId") REFERENCES "AccountType"("AccountTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostalCode" ADD CONSTRAINT "PostalCode_CityCode_fkey" FOREIGN KEY ("CityCode") REFERENCES "City"("CityCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_StateCode_fkey" FOREIGN KEY ("StateCode") REFERENCES "State"("StateCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_CountryCode_fkey" FOREIGN KEY ("CountryCode") REFERENCES "Country"("CountryCode") ON DELETE RESTRICT ON UPDATE CASCADE;
