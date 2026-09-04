import { prisma } from "../config/prisma";

const KEEP_CUSTOMER_COUNT = 10;
const PROTECTED_EMAILS = ["admin@jkbank.com", "teller@jkbank.com"];

async function pruneCustomers() {
  console.log("🧹 Starting database cleanup...");
  const startTime = Date.now();

  // 1. Pick 10 random fake customer CustIDs to preserve
  const preservedCustomers = await prisma.customerDetail.findMany({
    where: {
      EmailId: {
        notIn: PROTECTED_EMAILS,
      },
    },
    select: {
      CustID: true,
      EmailId: true,
    },
    take: KEEP_CUSTOMER_COUNT,
  });

  const preservedCustIds = preservedCustomers.map((c) => c.CustID);

  console.log(`📌 Preserving ${preservedCustIds.length} random fake customers:`);
  preservedCustomers.forEach((c, idx) => {
    console.log(`   ${idx + 1}. ${c.CustID} (${c.EmailId})`);
  });

  // 2. Delete all other customer records
  // Cascading deletes automatically wipe linked User, KYC, Accounts, Cards, and Txns
  console.log("\n🗑️ Deleting excess customer records...");
  const deleteResult = await prisma.customerDetail.deleteMany({
    where: {
      EmailId: {
        notIn: PROTECTED_EMAILS,
      },
      CustID: {
        notIn: preservedCustIds,
      },
    },
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Successfully removed ${deleteResult.count.toLocaleString()} customer profiles in ${duration}s.`);
  console.log("🔒 Admin, Teller, and 10 random customers remain intact.");
}

pruneCustomers()
  .catch((err) => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });