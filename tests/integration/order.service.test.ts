import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/lib/prisma.js";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  listOrdersForUser,
} from "../../src/services/order.service.js";
import { futureDateIso } from "../helpers/dates.js";
import {
  disconnectTestDatabase,
  setupTestDatabase,
  type TestFixtures,
} from "../helpers/test-db.js";

describe("order.service integration", () => {
  let fixtures: TestFixtures;

  beforeEach(async () => {
    fixtures = await setupTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("persists a new order with items in Postgres", async () => {
    const order = await createOrder(fixtures.userId, {
      contactId: fixtures.contactId,
      requestedDeliveryDate: futureDateIso(10),
      fulfillment: "delivery",
      notes: "Loading dock B",
      items: [
        { productId: fixtures.productIds[0]!, quantity: 12 },
        { productId: fixtures.productIds[1]!, quantity: 6 },
      ],
    });

    expect(order.orderNumber).toMatch(/^ORD-\d{4}-\d{5}$/);
    expect(order.contact.id).toBe(fixtures.contactId);
    expect(order.items).toHaveLength(2);

    const stored = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    expect(stored).not.toBeNull();
    expect(stored!.notes).toBe("Loading dock B");
    expect(stored!.items).toHaveLength(2);
  });

  it("lists only orders for the authenticated user", async () => {
    await createOrder(fixtures.userId, {
      contactId: fixtures.contactId,
      requestedDeliveryDate: futureDateIso(),
      fulfillment: "pickup",
      items: [{ productId: fixtures.productIds[0]!, quantity: 1 }],
    });

    await createOrder(fixtures.otherUserId, {
      contactId: fixtures.otherContactId,
      requestedDeliveryDate: futureDateIso(),
      fulfillment: "pickup",
      items: [{ productId: fixtures.productIds[0]!, quantity: 1 }],
    });

    const orders = await listOrdersForUser(fixtures.userId);

    expect(orders).toHaveLength(1);
    expect(orders[0]!.userId).toBe(fixtures.userId);
  });

  it("loads an order by id for the owner", async () => {
    const created = await createOrder(fixtures.userId, {
      contactId: fixtures.contactId,
      requestedDeliveryDate: futureDateIso(),
      fulfillment: "delivery",
      items: [{ productId: fixtures.productIds[0]!, quantity: 4 }],
    });

    const loaded = await getOrderById(fixtures.userId, created.id);

    expect(loaded.id).toBe(created.id);
    expect(loaded.items[0]!.quantity).toBe(4);
  });

  it("deletes an order from Postgres", async () => {
    const created = await createOrder(fixtures.userId, {
      contactId: fixtures.contactId,
      requestedDeliveryDate: futureDateIso(),
      fulfillment: "pickup",
      items: [{ productId: fixtures.productIds[0]!, quantity: 2 }],
    });

    await deleteOrder(fixtures.userId, created.id);

    const deleted = await prisma.order.findUnique({ where: { id: created.id } });
    expect(deleted).toBeNull();
  });
});
