import { prisma } from "../config/prisma";

async function main(){
    const customer = await prisma.customerDetail.findMany();

    console.log("Customers:",customer);
}
main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });