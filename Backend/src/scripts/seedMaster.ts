import { prisma } from "../config/prisma";
import { UserRole } from "../generated/prisma";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import crypto from "crypto";

const TOTAL_BULK_CUSTOMERS = 100_000;
const BATCH_SIZE = 2_000;

async function runMasterSeed() {
  console.log("🌱 Starting complete banking database seeding pipeline...");
  const masterStart = Date.now();

  // -------------------------------------------------------------
  // 1. BASE ACCOUNT TYPES (from seed.ts)
  // -------------------------------------------------------------
  console.log("\n📦 1/4 Provisioning Account Types...");
  const savingType = await prisma.accountType.upsert({
    where: { AccountTypeID: 1 },
    update: {},
    create: {
      AccountTypeID: 1,
      AccountType: "SAVING",
      AccSubType: "Standard Savings",
    },
  });

  await prisma.accountType.upsert({
    where: { AccountTypeID: 2 },
    update: {},
    create: {
      AccountTypeID: 2,
      AccountType: "LOAN",
      AccSubType: "Personal Loan",
    },
  });
  console.log("✅ SAVING and LOAN account types verified.");

  // -------------------------------------------------------------
  // 2. ADMIN USER PROVISIONING (from adminSeed.ts)
  // -------------------------------------------------------------
  console.log("\n🛡️ 2/4 Provisioning System Admin...");
  const adminEmail = "admin@jkbank.com";
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);

  const adminCustomer = await prisma.customerDetail.upsert({
    where: { EmailId: adminEmail },
    update: {},
    create: {
      CustID: "CUST-ADMIN-001",
      FirstName: "System",
      LastName: "Admin",
      EmailId: adminEmail,
      Mobile: "9999999999",
      DOB: new Date("1990-01-01"),
      Address1: "Headquarters, Main Branch",
      City: "Bengaluru",
      State: "Karnataka",
      Country: "India",
      ZIPCode: "560001",
    },
  });

  await prisma.user.upsert({
    where: { Email: adminEmail },
    update: { Role: UserRole.ADMIN },
    create: {
      Email: adminEmail,
      PasswordHash: adminPasswordHash,
      Role: UserRole.ADMIN,
      CustID: adminCustomer.CustID,
    },
  });
  console.log("✅ Admin provisioned: admin@jkbank.com / AdminPassword123!");

  // -------------------------------------------------------------
  // 3. BANK TELLER USER PROVISIONING (from seedTeller.ts)
  // -------------------------------------------------------------
  console.log("\n💼 3/4 Provisioning Bank Teller...");
  const tellerEmail = "teller@jkbank.com";
  const tellerPasswordHash = await bcrypt.hash("TellerPassword123!", 10);

  const tellerProfile = await prisma.customerDetail.upsert({
    where: { EmailId: tellerEmail },
    update: {},
    create: {
      CustID: "CUST-TELLER-001",
      FirstName: "Branch",
      LastName: "Teller",
      EmailId: tellerEmail,
      Mobile: "9888888888",
      DOB: new Date("1995-05-15"),
      Address1: "Main Branch Office, Counter 02",
      City: "Bengaluru",
      State: "Karnataka",
      Country: "India",
      ZIPCode: "560001",
    },
  });

  await prisma.user.upsert({
    where: { Email: tellerEmail },
    update: { Role: UserRole.BANK_TELLER },
    create: {
      Email: tellerEmail,
      PasswordHash: tellerPasswordHash,
      Role: UserRole.BANK_TELLER,
      CustID: tellerProfile.CustID,
    },
  });
  console.log("✅ Bank Teller provisioned: teller@jkbank.com / TellerPassword123!");

  // -------------------------------------------------------------
  // 4. BULK CUSTOMERS (1,00,000 Records with Extended Timeout)
  // -------------------------------------------------------------
  console.log(`\n🚀 4/4 Seeding ${TOTAL_BULK_CUSTOMERS.toLocaleString()} customer records in chunks of ${BATCH_SIZE}...`);
  const defaultCustomerPasswordHash = await bcrypt.hash("Customer@12345", 8);
  const totalBatches = Math.ceil(TOTAL_BULK_CUSTOMERS / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = Date.now();
    const currentBatchCount = Math.min(BATCH_SIZE, TOTAL_BULK_CUSTOMERS - batch * BATCH_SIZE);

    const customers: any[] = [];
    const users: any[] = [];
    const kycDocs: any[] = [];
    const accounts: any[] = [];
    const savings: any[] = [];
    const cards: any[] = [];
    const initialTxns: any[] = [];

    for (let i = 0; i < currentBatchCount; i++) {
      const globalIdx = batch * BATCH_SIZE + i;
      const uuidSuffix = crypto.randomUUID().slice(0, 8).toUpperCase();

      const custId = `CUST-${uuidSuffix}-${globalIdx}`;
      const acctNum = `4092${String(globalIdx).padStart(12, "0")}`;
      const email = `user_${globalIdx}_${faker.string.alphanumeric(4)}@jkbank.com`.toLowerCase();
      const mobile = `98${String(globalIdx).padStart(8, "0")}`;
      const docNumber = `DOC-${uuidSuffix}-${globalIdx}`;
      const initialBalance = parseFloat(faker.finance.amount({ min: 5000, max: 250000, dec: 2 }));

      // Profile
      customers.push({
        CustID: custId,
        FirstName: faker.person.firstName(),
        LastName: faker.person.lastName(),
        Address1: faker.location.streetAddress(),
        Address2: faker.location.secondaryAddress(),
        City: faker.location.city(),
        State: faker.location.state(),
        Country: "India",
        ZIPCode: faker.location.zipCode("######"),
        EmailId: email,
        Phone: faker.phone.number({ style: "national" }),
        Mobile: mobile,
        DOB: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
        MaritalStatus: faker.helpers.arrayElement(["Single", "Married", "Divorced"]),
      });

      // User Credentials
      users.push({
        UserID: crypto.randomUUID(),
        Email: email,
        PasswordHash: defaultCustomerPasswordHash,
        Role: "CUSTOMER",
        CustID: custId,
      });

      // KYC
      kycDocs.push({
        KYCID: crypto.randomUUID(),
        CustID: custId,
        DocumentType: faker.helpers.arrayElement(["PAN", "PASSPORT", "VOTER_ID"]),
        DocumentNumber: docNumber,
        IssueDate: faker.date.past({ years: 5 }),
        ExpiryDate: faker.date.future({ years: 10 }),
        VerificationStatus: "VERIFIED",
      });

      // CustomerAccount Hub (with Status enum)
      accounts.push({
        AcctNum: acctNum,
        CustID: custId,
        AccountTypeID: savingType.AccountTypeID,
        Status: "ACTIVE",
      });

      // Saving Details
      savings.push({
        AcctNum: acctNum,
        SavingAccountTypeId: savingType.AccountTypeID,
        Balance: initialBalance,
        TransferLimit: 100000.0,
        BranchCode: faker.helpers.arrayElement(["BR001", "BR002", "BR003", "BR004"]),
        IFSCCode: "JKBK0000001",
      });

      // Debit Card
      cards.push({
        CardID: crypto.randomUUID(),
        AcctNum: acctNum,
        CardNumberHash: crypto.createHash("sha256").update(acctNum + "-CARD").digest("hex"),
        CardType: faker.helpers.arrayElement(["DEBIT_VISA", "DEBIT_MASTERCARD", "DEBIT_RUPAY"]),
        ExpiryDate: faker.date.future({ years: 5 }),
        CardStatus: "ACTIVE",
      });

      // Transaction Ledger
      initialTxns.push({
        TxnID: `TXN-${crypto.randomUUID()}`,
        AcctNum: acctNum,
        TxnDate: new Date(),
        TxnDetail: "Initial Account Opening Deposit",
        WithdrawAmount: 0.0,
        DepositAmount: initialBalance,
        Balance: initialBalance,
      });
    }

    // Interactive Transaction with extended timeouts
    await prisma.$transaction(
      async (tx) => {
        await tx.customerDetail.createMany({ data: customers });
        await tx.user.createMany({ data: users });
        await tx.kYCDetail.createMany({ data: kycDocs });
        await tx.customerAccount.createMany({ data: accounts });
        await tx.savingAccountDetail.createMany({ data: savings });
        await tx.cardDetail.createMany({ data: cards });
        await tx.savingAccountTxnHistory.createMany({ data: initialTxns });
      },
      {
        maxWait: 20000, // 20s
        timeout: 45000, // 45s
      }
    );

    const batchDuration = ((Date.now() - batchStart) / 1000).toFixed(2);
    const progress = (((batch + 1) / totalBatches) * 100).toFixed(1);
    console.log(`✅ Batch ${batch + 1}/${totalBatches} (${progress}%) inserted in ${batchDuration}s`);
  }

  const totalTime = ((Date.now() - masterStart) / 1000).toFixed(2);
  console.log(`\n🎉 Seeding pipeline completed successfully in ${totalTime}s!`);
}

runMasterSeed()
  .catch((err) => {
    console.error("❌ Master Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });