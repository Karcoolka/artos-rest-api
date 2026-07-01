import bcrypt from "bcrypt";
import { prisma } from "../../src/lib/prisma.js";

export const TEST_API_KEY = "test-api-key";
export const OTHER_API_KEY = "other-test-api-key";

export type TestFixtures = {
  userId: string;
  otherUserId: string;
  contactId: string;
  otherContactId: string;
  productIds: string[];
  inactiveProductId: string;
};

export async function resetDatabase(): Promise<void> {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedTestFixtures(): Promise<TestFixtures> {
  const user = await prisma.user.create({
    data: {
      name: "Test Wholesale",
      apiKeyHash: await bcrypt.hash(TEST_API_KEY, 10),
      contacts: {
        create: {
          name: "Test Contact",
          email: "test@example.com",
          phone: "+420111222333",
        },
      },
    },
    include: { contacts: true },
  });

  const otherUser = await prisma.user.create({
    data: {
      name: "Other Wholesale",
      apiKeyHash: await bcrypt.hash(OTHER_API_KEY, 10),
      contacts: {
        create: {
          name: "Other Contact",
          email: "other@example.com",
        },
      },
    },
    include: { contacts: true },
  });

  const activeProducts = await Promise.all([
    prisma.product.create({
      data: { sku: "TEST-SKU-1", name: "Test Product 1" },
    }),
    prisma.product.create({
      data: { sku: "TEST-SKU-2", name: "Test Product 2" },
    }),
  ]);

  const inactiveProduct = await prisma.product.create({
    data: { sku: "TEST-SKU-INACTIVE", name: "Inactive Product", active: false },
  });

  return {
    userId: user.id,
    otherUserId: otherUser.id,
    contactId: user.contacts[0]!.id,
    otherContactId: otherUser.contacts[0]!.id,
    productIds: activeProducts.map((product) => product.id),
    inactiveProductId: inactiveProduct.id,
  };
}

export async function setupTestDatabase(): Promise<TestFixtures> {
  await resetDatabase();
  return seedTestFixtures();
}

export async function disconnectTestDatabase(): Promise<void> {
  await prisma.$disconnect();
}
