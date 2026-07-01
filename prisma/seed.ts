import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEV_API_KEYS = {
  artos: "dev-artos-key",
  deli: "dev-deli-key",
} as const;

async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, 10);
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const artosUser = await prisma.user.create({
    data: {
      name: "Artos Wholesale",
      apiKeyHash: await hashApiKey(DEV_API_KEYS.artos),
      contacts: {
        create: [
          {
            name: "Jana Novakova",
            email: "jana.novakova@artos-wholesale.cz",
            phone: "+420777111222",
          },
          {
            name: "Petr Svoboda",
            email: "petr.svoboda@artos-wholesale.cz",
            phone: "+420777333444",
          },
        ],
      },
    },
    include: { contacts: true },
  });

  const deliUser = await prisma.user.create({
    data: {
      name: "Downtown Deli Co.",
      apiKeyHash: await hashApiKey(DEV_API_KEYS.deli),
      contacts: {
        create: [
          {
            name: "Maria Keller",
            email: "maria@downtowndeli.cz",
            phone: "+420777555666",
          },
        ],
      },
    },
    include: { contacts: true },
  });

  const products = await prisma.product.createMany({
    data: [
      { sku: "CROISSANT-001", name: "Butter Croissant" },
      { sku: "SOUR-LOAF-001", name: "Sourdough Loaf" },
      { sku: "BAGUETTE-001", name: "Classic Baguette" },
      { sku: "ROLL-001", name: "Poppy Seed Roll" },
    ],
  });

  console.log("Seed completed.\n");
  console.log("Dev API keys:");
  console.log(`  Artos Wholesale:  ${DEV_API_KEYS.artos}`);
  console.log(`  Downtown Deli Co: ${DEV_API_KEYS.deli}\n`);

  console.log("Users:");
  console.log(`  ${artosUser.name}: ${artosUser.id}`);
  console.log(`  ${deliUser.name}: ${deliUser.id}\n`);

  console.log("Contacts:");
  for (const contact of [...artosUser.contacts, ...deliUser.contacts]) {
    console.log(`  ${contact.name}: ${contact.id}`);
  }

  console.log(`\nProducts created: ${products.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
