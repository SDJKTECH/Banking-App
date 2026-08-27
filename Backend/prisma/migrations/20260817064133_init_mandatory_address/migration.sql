/*
  Warnings:

  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostalCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `State` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `City` to the `CustomerDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Country` to the `CustomerDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `State` to the `CustomerDetail` table without a default value. This is not possible if the table is not empty.
  - Made the column `ZIPCode` on table `CustomerDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_StateCode_fkey";

-- DropForeignKey
ALTER TABLE "CustomerDetail" DROP CONSTRAINT "CustomerDetail_ZIPCode_fkey";

-- DropForeignKey
ALTER TABLE "PostalCode" DROP CONSTRAINT "PostalCode_CityCode_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_CountryCode_fkey";

-- AlterTable
ALTER TABLE "CustomerDetail" ADD COLUMN     "City" TEXT NOT NULL,
ADD COLUMN     "Country" TEXT NOT NULL,
ADD COLUMN     "State" TEXT NOT NULL,
ALTER COLUMN "ZIPCode" SET NOT NULL;

-- DropTable
DROP TABLE "City";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "PostalCode";

-- DropTable
DROP TABLE "State";
