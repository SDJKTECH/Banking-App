import { prisma } from "../config/prisma";
import { UserRole } from "../generated/prisma";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import crypto from "crypto";

const CUSTOMER_COUNT = 10;

// Helper to produce a random unique 16-digit account number
function generateRandomAcctNum(): string {
  const prefix = "4092";
  let rest = "";
  for (let i = 0; i < 12; i++) {
    rest += crypto.randomInt(0, 10).toString();
  }
  return `${prefix}${rest}`;
}

async function seedCloudMinimal() {
  console.log("🌱 Starting minimal Cloud SQL seeding...");
  const startTime = Date.now();

  // 1. Provision Account Types
  console.log("📦 Provisioning Account Types...");
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
  console.log("✅ Account types verified.");

  // 2. Provision Admin User
  console.log("🛡️ Provisioning System Admin...");
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
  console.log("✅ Admin ready: admin@jkbank.com / AdminPassword123!");

  // 3. Provision Bank Teller User
  console.log("💼 Provisioning Bank Teller...");
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
  console.log("✅ Teller ready: teller@jkbank.com / TellerPassword123!");

  // 4. Provision 10 Fake Customers with Non-Colliding Data
  console.log(`🚀 Creating ${CUSTOMER_COUNT} sample customers...`);
  const defaultPasswordHash = await bcrypt.hash("Customer@12345", 8);

  const customers: any[] = [];
  const users: any[] = [];
  const kycDocs: any[] = [];
  const accounts: any[] = [];
  const savings: any[] = [];
  const cards: any[] = [];
  const initialTxns: any[] = [];

  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const uuidSuffix = crypto.randomUUID().slice(0, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const custId = `CUST-${uuidSuffix}-${timestamp}-${i}`;
    const acctNum = generateRandomAcctNum();
    const email = `customer_${i}_${faker.string.alphanumeric(6)}@jkbank.com`.toLowerCase();
    const mobile = `9${crypto.randomInt(100000000, 999999999)}`;
    const docNumber = `DOC-${uuidSuffix}-${timestamp}-${i}`;
    const initialBalance = parseFloat(faker.finance.amount({ min: 5000, max: 250000, dec: 2 }));

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

    users.push({
      UserID: crypto.randomUUID(),
      Email: email,
      PasswordHash: defaultPasswordHash,
      Role: UserRole.CUSTOMER,
      CustID: custId,
    });

    kycDocs.push({
      KYCID: crypto.randomUUID(),
      CustID: custId,
      DocumentType: faker.helpers.arrayElement(["PAN", "PASSPORT", "VOTER_ID"]),
      DocumentNumber: docNumber,
      IssueDate: faker.date.past({ years: 5 }),
      ExpiryDate: faker.date.future({ years: 10 }),
      VerificationStatus: "VERIFIED",
    });

    accounts.push({
      AcctNum: acctNum,
      CustID: custId,
      AccountTypeID: savingType.AccountTypeID,
      Status: "ACTIVE",
    });

    savings.push({
      AcctNum: acctNum,
      SavingAccountTypeId: savingType.AccountTypeID,
      Balance: initialBalance,
      TransferLimit: 100000.0,
      BranchCode: faker.helpers.arrayElement(["BR001", "BR002", "BR003"]),
      IFSCCode: "JKBK0000001",
    });

    cards.push({
      CardID: crypto.randomUUID(),
      AcctNum: acctNum,
      CardNumberHash: crypto.createHash("sha256").update(acctNum + "-CARD").digest("hex"),
      CardType: faker.helpers.arrayElement(["DEBIT_VISA", "DEBIT_MASTERCARD"]),
      ExpiryDate: faker.date.future({ years: 5 }),
      CardStatus: "ACTIVE",
    });

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

  await prisma.$transaction(async (tx) => {
    await tx.customerDetail.createMany({ data: customers });
    await tx.user.createMany({ data: users });
    await tx.kYCDetail.createMany({ data: kycDocs });
    await tx.customerAccount.createMany({ data: accounts });
    await tx.savingAccountDetail.createMany({ data: savings });
    await tx.cardDetail.createMany({ data: cards });
    await tx.savingAccountTxnHistory.createMany({ data: initialTxns });
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 Minimal cloud seed completed successfully in ${duration}s!`);
}

seedCloudMinimal()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });