import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../api";
import type { Order } from "../types";

type Props = {
  apiKey: string;
  refreshKey: number;
};

export function OrdersList({ apiKey, refreshKey }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<Order[]>(apiKey, "/orders");
        if (!cancelled) {
          setOrders(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load orders",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [apiKey, refreshKey]);

  if (!apiKey) {
    return null;
  }

  return (
    <section className="card">
      <h2>Your orders</h2>
      {loading && <p className="muted">Loading orders…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="muted">No orders yet.</p>
      )}
      {!loading && orders.length > 0 && (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id}>
              <strong>{order.orderNumber}</strong>
              <span>
                {order.requestedDeliveryDate} · {order.fulfillment} ·{" "}
                {order.status}
              </span>
              <span>{order.items.length} item(s)</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
