// src/scripts/seedTeller.ts
import { prisma } from "../config/prisma";
import { UserRole } from "../generated/prisma";
import bcrypt from "bcrypt";

async function main() {
  const tellerEmail = "teller@jkbank.com";
  const passwordHash = await bcrypt.hash("TellerPassword123!", 10);

  // 1. Create Staff Customer Profile
  const staffProfile = await prisma.customerDetail.upsert({
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

  // 2. Create Staff User Account with BANK_TELLER Role
  await prisma.user.upsert({
    where: { Email: tellerEmail },
    update: {
      Role: UserRole.BANK_TELLER,
    },
    create: {
      Email: tellerEmail,
      PasswordHash: passwordHash,
      Role: UserRole.BANK_TELLER,
      CustID: staffProfile.CustID,
    },
  });

  console.log("✅ Bank Teller provisioned successfully: teller@jkbank.com / TellerPassword123!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });