import { describe, expect, it } from "vitest";
import { idParamSchema } from "../../src/validators/id-param.schema.js";

describe("idParamSchema", () => {
  it("accepts a valid UUID", () => {
    const result = idParamSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID id", () => {
    const result = idParamSchema.safeParse({ id: "123" });

    expect(result.success).toBe(false);
  });
});
