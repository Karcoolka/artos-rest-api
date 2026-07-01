import { describe, expect, it } from "vitest";
import { createOrderSchema } from "../../src/validators/create-order.schema.js";
import { futureDateIso } from "../helpers/dates.js";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";
const validUuid2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    contactId: validUuid,
    requestedDeliveryDate: futureDateIso(),
    fulfillment: "delivery",
    items: [{ productId: validUuid2, quantity: 2 }],
    ...overrides,
  };
}

describe("createOrderSchema", () => {
  it("accepts a valid payload", () => {
    const result = createOrderSchema.safeParse(validPayload());

    expect(result.success).toBe(true);
  });

  it("rejects invalid contactId", () => {
    const result = createOrderSchema.safeParse(
      validPayload({ contactId: "not-a-uuid" }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects invalid delivery date format", () => {
    const result = createOrderSchema.safeParse(
      validPayload({ requestedDeliveryDate: "10-07-2026" }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects invalid fulfillment", () => {
    const result = createOrderSchema.safeParse(
      validPayload({ fulfillment: "courier" }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects empty items array", () => {
    const result = createOrderSchema.safeParse(validPayload({ items: [] }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.items).toBeDefined();
    }
  });

  it("rejects non-positive quantity", () => {
    const result = createOrderSchema.safeParse(
      validPayload({
        items: [{ productId: validUuid2, quantity: 0 }],
      }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects non-integer quantity", () => {
    const result = createOrderSchema.safeParse(
      validPayload({
        items: [{ productId: validUuid2, quantity: 1.5 }],
      }),
    );

    expect(result.success).toBe(false);
  });

  it("trims notes", () => {
    const result = createOrderSchema.parse(
      validPayload({ notes: "  hello  " }),
    );

    expect(result.notes).toBe("hello");
  });
});
