import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { futureDateIso } from "../helpers/dates.js";
import {
  disconnectTestDatabase,
  OTHER_API_KEY,
  setupTestDatabase,
  TEST_API_KEY,
  type TestFixtures,
} from "../helpers/test-db.js";

describe("orders API", () => {
  const app = createApp();
  let fixtures: TestFixtures;

  beforeEach(async () => {
    fixtures = await setupTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  function auth(apiKey = TEST_API_KEY) {
    return { "X-API-Key": apiKey };
  }

  function validOrderBody(overrides: Record<string, unknown> = {}) {
    return {
      contactId: fixtures.contactId,
      requestedDeliveryDate: futureDateIso(14),
      fulfillment: "delivery",
      items: [{ productId: fixtures.productIds[0]!, quantity: 8 }],
      ...overrides,
    };
  }

  it("creates an order (happy path)", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .set(auth())
      .send(validOrderBody({ notes: "Back entrance" }));

    expect(response.status).toBe(201);
    expect(response.body.orderNumber).toMatch(/^ORD-\d{4}-\d{5}$/);
    expect(response.body.status).toBe("submitted");
    expect(response.body.contact.id).toBe(fixtures.contactId);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.notes).toBe("Back entrance");
  });

  it("returns 401 when API key is missing", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .send(validOrderBody());

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Missing API key");
  });

  it("returns 401 when API key is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .set(auth("invalid-key"))
      .send(validOrderBody());

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or missing API key");
  });

  it("returns 400 for invalid request body", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .set(auth())
      .send({
        ...validOrderBody(),
        items: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details.items).toBeDefined();
  });

  it("returns 404 when contact does not belong to the user", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .set(auth())
      .send(validOrderBody({ contactId: fixtures.otherContactId }));

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Contact not found");
  });

  it("returns 404 when fetching another user's order", async () => {
    const created = await request(app)
      .post("/api/v1/orders")
      .set(auth())
      .send(validOrderBody());

    const response = await request(app)
      .get(`/api/v1/orders/${created.body.id}`)
      .set(auth(OTHER_API_KEY));

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Order not found");
  });

  it("returns 404 for unknown order id", async () => {
    const response = await request(app)
      .get("/api/v1/orders/550e8400-e29b-41d4-a716-446655440099")
      .set(auth());

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Order not found");
  });

  it("returns 400 for invalid order id param", async () => {
    const response = await request(app)
      .get("/api/v1/orders/not-a-uuid")
      .set(auth());

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });
});
