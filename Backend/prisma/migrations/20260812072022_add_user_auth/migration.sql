-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');

-- CreateTable
CREATE TABLE "User" (
    "UserID" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CustID" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User_CustID_key" ON "User"("CustID");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_CustID_fkey" FOREIGN KEY ("CustID") REFERENCES "CustomerDetail"("CustID") ON DELETE CASCADE ON UPDATE CASCADE;
