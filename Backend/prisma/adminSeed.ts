import { prisma } from "../src/config/prisma";
import { UserRole } from "../src/generated/prisma";
import bcrypt from "bcrypt";

async function main() {
  const adminEmail = "admin@jkbank.com";
  const passwordHash = await bcrypt.hash("AdminPassword123!", 10);

  // 1. Create Staff Customer Profile
  const staffCustomer = await prisma.customerDetail.upsert({
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

  // 2. Create Staff User Account with ADMIN Role
  await prisma.user.upsert({
    where: { Email: adminEmail },
    update: {
      Role: UserRole.ADMIN,
    },
    create: {
      Email: adminEmail,
      PasswordHash: passwordHash,
      Role: UserRole.ADMIN,
      CustID: staffCustomer.CustID,
    },
  });

  console.log("Admin user created: admin@jkbank.com");
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());