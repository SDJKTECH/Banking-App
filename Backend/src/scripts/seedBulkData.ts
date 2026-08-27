import { prisma } from "../config/prisma";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import crypto from "crypto";

const TOTAL_RECORDS = 100_000;
const BATCH_SIZE = 2_000;

async function seedOneLakhData() {
  console.log(`🚀 Starting bulk generation & insertion of ${TOTAL_RECORDS.toLocaleString()} records...`);
  const startTime = Date.now();

  const savingType = await prisma.accountType.upsert({
    where: { AccountTypeID: 1 },
    update: {},
    create: {
      AccountTypeID: 1,
      AccountType: "SAVING",
      AccSubType: "Standard Savings",
    },
  });

  const accountTypeId = savingType.AccountTypeID;

  console.log("🔐 Pre-computing single bcrypt hash for users...");
  const defaultPasswordHash = await bcrypt.hash("Customer@12345", 8);

  const totalBatches = Math.ceil(TOTAL_RECORDS / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = Date.now();
    const currentBatchCount = Math.min(BATCH_SIZE, TOTAL_RECORDS - batch * BATCH_SIZE);

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

      // 1. CustomerDetail
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

      // 2. User
      users.push({
        UserID: crypto.randomUUID(),
        Email: email,
        PasswordHash: defaultPasswordHash,
        Role: "CUSTOMER",
        CustID: custId,
      });

      // 3. KYCDetail
      kycDocs.push({
        KYCID: crypto.randomUUID(),
        CustID: custId,
        DocumentType: faker.helpers.arrayElement(["PAN", "PASSPORT"]),
        DocumentNumber: docNumber,
        IssueDate: faker.date.past({ years: 5 }),
        ExpiryDate: faker.date.future({ years: 10 }),
        VerificationStatus: "VERIFIED",
      });

      // 4. CustomerAccount
      accounts.push({
        AcctNum: acctNum,
        CustID: custId,
        AccountTypeID: accountTypeId,
        Status: "ACTIVE",
      });

      // 5. SavingAccountDetail
      savings.push({
        AcctNum: acctNum,
        SavingAccountTypeId: accountTypeId,
        Balance: initialBalance,
        TransferLimit: 100000.0,
        BranchCode: faker.helpers.arrayElement(["BR001", "BR002", "BR003", "BR004"]),
        IFSCCode: "JKBK0000001",
      });

      // 6. CardDetail
      cards.push({
        CardID: crypto.randomUUID(),
        AcctNum: acctNum,
        CardNumberHash: crypto.createHash("sha256").update(acctNum + "-CARD").digest("hex"),
        CardType: faker.helpers.arrayElement(["DEBIT_VISA", "DEBIT_MASTERCARD", "DEBIT_RUPAY"]),
        ExpiryDate: faker.date.future({ years: 5 }),
        CardStatus: "ACTIVE",
      });

      // 7. Initial Transaction Audit
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

    // Extended timeout settings for large bulk operations
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
        maxWait: 20000, // Wait up to 20s to acquire transaction slot
        timeout: 30000, // Allow up to 30s execution before timeout
      }
    );

    const batchDuration = ((Date.now() - batchStart) / 1000).toFixed(2);
    const progress = (((batch + 1) / totalBatches) * 100).toFixed(1);
    console.log(`✅ Batch ${batch + 1}/${totalBatches} (${progress}%) inserted in ${batchDuration}s`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🎉 Inserted ${TOTAL_RECORDS.toLocaleString()} records in ${totalTime}s!`);
}

seedOneLakhData()
  .catch((err) => {
    console.error("❌ Bulk seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });