import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../src/errors/app-error.js";
import { futureDateIso, pastDateIso } from "../helpers/dates.js";

const prismaMock = vi.hoisted(() => ({
  product: { findMany: vi.fn() },
  contact: { findFirst: vi.fn() },
  order: {
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

import {
  createOrder,
  deleteOrder,
  getOrderById,
  patchOrder,
} from "../../src/services/order.service.js";

const userId = "550e8400-e29b-41d4-a716-446655440001";
const contactId = "550e8400-e29b-41d4-a716-446655440002";
const productId = "550e8400-e29b-41d4-a716-446655440003";
const orderId = "550e8400-e29b-41d4-a716-446655440004";

function validCreateInput() {
  return {
    contactId,
    requestedDeliveryDate: futureDateIso(),
    fulfillment: "delivery" as const,
    items: [{ productId, quantity: 3 }],
  };
}

function mockOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: orderId,
    orderNumber: "ORD-2026-00001",
    userId,
    contactId,
    requestedDeliveryDate: new Date(`${futureDateIso()}T00:00:00.000Z`),
    fulfillment: "delivery",
    status: "submitted",
    notes: null,
    createdAt: new Date(),
    contact: {
      id: contactId,
      userId,
      name: "Test Contact",
      email: "test@example.com",
      phone: null,
    },
    items: [
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        orderId,
        productId,
        quantity: 3,
        product: {
          id: productId,
          sku: "TEST-SKU-1",
          name: "Test Product",
          active: true,
        },
      },
    ],
    ...overrides,
  };
}

describe("order.service business rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrder", () => {
    it("rejects duplicate products in items", async () => {
      prismaMock.contact.findFirst.mockResolvedValue({ id: contactId, userId });

      await expect(
        createOrder(userId, {
          ...validCreateInput(),
          items: [
            { productId, quantity: 1 },
            { productId, quantity: 2 },
          ],
        }),
      ).rejects.toSatisfy(
        (error: unknown) =>
          error instanceof ValidationError &&
          error.message === "Duplicate products in order items",
      );
    });

    it("rejects delivery date in the past", async () => {
      prismaMock.contact.findFirst.mockResolvedValue({ id: contactId, userId });
      prismaMock.product.findMany.mockResolvedValue([
        { id: productId, active: true },
      ]);

      await expect(
        createOrder(userId, {
          ...validCreateInput(),
          requestedDeliveryDate: pastDateIso(),
        }),
      ).rejects.toThrow("requestedDeliveryDate cannot be in the past");
    });

    it("rejects missing or inactive products", async () => {
      prismaMock.contact.findFirst.mockResolvedValue({ id: contactId, userId });
      prismaMock.product.findMany.mockResolvedValue([]);

      await expect(createOrder(userId, validCreateInput())).rejects.toThrow(
        "One or more products not found or inactive",
      );
    });

    it("rejects contact that does not belong to the user", async () => {
      prismaMock.contact.findFirst.mockResolvedValue(null);

      await expect(createOrder(userId, validCreateInput())).rejects.toThrow(
        "Contact not found",
      );
    });
  });

  describe("getOrderById", () => {
    it("throws when order is not found", async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(getOrderById(userId, orderId)).rejects.toThrow(
        "Order not found",
      );
    });
  });

  describe("patchOrder", () => {
    it("throws when order is not found", async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(
        patchOrder(userId, orderId, { fulfillment: "pickup" }),
      ).rejects.toThrow("Order not found");
    });

    it("rejects updates to non-submitted orders", async () => {
      prismaMock.order.findFirst.mockResolvedValue(
        mockOrder({ status: "cancelled" }),
      );

      await expect(
        patchOrder(userId, orderId, { fulfillment: "pickup" }),
      ).rejects.toThrow("Only submitted orders can be changed");
    });
  });

  describe("deleteOrder", () => {
    it("throws when order is not found", async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(deleteOrder(userId, orderId)).rejects.toThrow(
        "Order not found",
      );
    });
  });
});
