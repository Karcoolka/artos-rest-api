import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, ApiError } from "../api";
import type {
  Contact,
  CreateOrderPayload,
  Order,
  OrderLineDraft,
  Product,
} from "../types";

type Props = {
  apiKey: string;
  contacts: Contact[];
  products: Product[];
  onCreated: (order: Order) => void;
};

const emptyLine = (products: Product[]): OrderLineDraft => ({
  productId: products[0]?.id ?? "",
  quantity: 1,
});

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function OrderForm({ apiKey, contacts, products, onCreated }: Props) {
  const [contactId, setContactId] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState(
    tomorrowIsoDate(),
  );
  const [fulfillment, setFulfillment] =
    useState<CreateOrderPayload["fulfillment"]>("delivery");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLineDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (contacts.length > 0 && !contactId) {
      setContactId(contacts[0]!.id);
    }
  }, [contacts, contactId]);

  useEffect(() => {
    if (products.length > 0 && lines.length === 0) {
      setLines([emptyLine(products)]);
    }
  }, [products, lines.length]);

  function updateLine(index: number, patch: Partial<OrderLineDraft>) {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function addLine() {
    setLines((current) => [...current, emptyLine(products)]);
  }

  function removeLine(index: number) {
    setLines((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const payload: CreateOrderPayload = {
      contactId,
      requestedDeliveryDate,
      fulfillment,
      items: lines.filter((line) => line.productId && line.quantity > 0),
      notes: notes.trim() || undefined,
    };

    try {
      const order = await apiFetch<Order>(apiKey, "/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess(`Order ${order.orderNumber} created.`);
      onCreated(order);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }

  if (contacts.length === 0 || products.length === 0) {
    return (
      <p className="muted">
        Load contacts and products with a valid API key first.
      </p>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>New order</h2>

      <label>
        Contact
        <select
          value={contactId}
          onChange={(event) => setContactId(event.target.value)}
          required
        >
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name} ({contact.email})
            </option>
          ))}
        </select>
      </label>

      <label>
        Requested delivery date
        <input
          type="date"
          value={requestedDeliveryDate}
          onChange={(event) => setRequestedDeliveryDate(event.target.value)}
          required
        />
      </label>

      <fieldset>
        <legend>Fulfillment</legend>
        <label className="inline">
          <input
            type="radio"
            name="fulfillment"
            value="delivery"
            checked={fulfillment === "delivery"}
            onChange={() => setFulfillment("delivery")}
          />
          Delivery
        </label>
        <label className="inline">
          <input
            type="radio"
            name="fulfillment"
            value="pickup"
            checked={fulfillment === "pickup"}
            onChange={() => setFulfillment("pickup")}
          />
          Pickup
        </label>
      </fieldset>

      <div className="lines">
        <h3>Items</h3>
        {lines.map((line, index) => (
          <div className="line-row" key={index}>
            <select
              value={line.productId}
              onChange={(event) =>
                updateLine(index, { productId: event.target.value })
              }
              required
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(event) =>
                updateLine(index, { quantity: Number(event.target.value) })
              }
              required
            />
            <button
              type="button"
              className="secondary"
              onClick={() => removeLine(index)}
              disabled={lines.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="secondary" onClick={addLine}>
          Add item
        </button>
      </div>

      <label>
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Optional delivery notes"
        />
      </label>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit order"}
      </button>
    </form>
  );
}
