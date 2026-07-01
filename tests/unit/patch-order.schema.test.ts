import { describe, expect, it } from "vitest";
import { patchOrderSchema } from "../../src/validators/create-order.schema.js";
import { futureDateIso } from "../helpers/dates.js";

describe("patchOrderSchema", () => {
  it("accepts a single field update", () => {
    const result = patchOrderSchema.safeParse({
      fulfillment: "pickup",
    });

    expect(result.success).toBe(true);
  });

  it("accepts nullable notes", () => {
    const result = patchOrderSchema.safeParse({ notes: null });

    expect(result.success).toBe(true);
  });

  it("rejects empty payload", () => {
    const result = patchOrderSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().formErrors).toContain(
        "At least one field is required",
      );
    }
  });

  it("rejects invalid delivery date format", () => {
    const result = patchOrderSchema.safeParse({
      requestedDeliveryDate: "2026/07/10",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid delivery date", () => {
    const result = patchOrderSchema.safeParse({
      requestedDeliveryDate: futureDateIso(),
    });

    expect(result.success).toBe(true);
  });
});
