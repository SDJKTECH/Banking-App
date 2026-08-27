import { prisma } from "../src/config/prisma";

async function main() {
  console.log("Seeding database...");

  // Seed SAVING account type (AccountTypeID: 1)
  await prisma.accountType.upsert({
    where: { AccountTypeID: 1 },
    update: {},
    create: {
      AccountTypeID: 1,
      AccountType: "SAVING",
      AccSubType: "Standard Savings",
    },
  });

  // Seed LOAN account type (AccountTypeID: 2)
  await prisma.accountType.upsert({
    where: { AccountTypeID: 2 },
    update: {},
    create: {
      AccountTypeID: 2,
      AccountType: "LOAN",
      AccSubType: "Personal Loan",
    },
  });

  console.log("Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });