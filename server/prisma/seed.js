const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    await prisma.ticketType.upsert({
        where: {
            name: "General Entry"
        },
        update: {},
        create: {
            name: "General Entry",
            price: 10000,
            description: "General museum entry"
        }
    });

    console.log("Seed data inserted successfully!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
