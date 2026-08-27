import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma";
import { randomUUID } from "node:crypto";

// Accept any transaction client or base Prisma client
type DBClient = Prisma.TransactionClient | typeof prisma;

// Generate CustID
export function generateCustomerId(): string {
    return `CUST-${randomUUID()}`;
}

// Generate 16-digit Account Number
export async function generateAccountNumber(
    db: DBClient = prisma
): Promise<string> {
    let accountNumber: string;

    do {
        const uuid = randomUUID().replace(/-/g, "");
        accountNumber = "";

        for (const char of uuid) {
            accountNumber += parseInt(char, 16) % 10; //convert hexadecimal to standard 10 decimal integer
            if (accountNumber.length === 16) {
                break;
            }
        }

        const existingAccount = await db.customerAccount.findUnique({
            where: {
                AcctNum: accountNumber,
            },
        });

        if (!existingAccount) {
            return accountNumber;
        }
    } while (true);
}



export async function createUser(
    data:{
        Email:string;
        PasswordHash:string;
        CustID:string
    },
    db:DBClient=prisma
){
    return db.user.create({
        data:{
            Email:data.Email,
            PasswordHash:data.PasswordHash,
            CustID:data.CustID,
            Role:"CUSTOMER"
        },

    });
}


export async function findUserByEmail(email : string, db : DBClient = prisma){
    return db.user.findUnique({
        where : {
            Email:email
        },
        include : {
            Customer:true
        },
    });
}
export async function updateUserPassword(userId: string, newPasswordHash: string) {
  return await prisma.user.update({
    where: { UserID: userId },
    data: { PasswordHash: newPasswordHash },
  });
}