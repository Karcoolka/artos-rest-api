import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "./api";
import { OrderForm } from "./components/OrderForm";
import { OrdersList } from "./components/OrdersList";
import type { Contact, Order, Product } from "./types";
import "./index.css";

const API_KEY_STORAGE = "artos-api-key";

export default function App() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(API_KEY_STORAGE) ?? "dev-artos-key",
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey.trim()) {
      setContacts([]);
      setProducts([]);
      return;
    }

    let cancelled = false;

    async function loadCatalog() {
      setCatalogLoading(true);
      setCatalogError(null);

      try {
        const [loadedContacts, loadedProducts] = await Promise.all([
          apiFetch<Contact[]>(apiKey, "/contacts"),
          apiFetch<Product[]>(apiKey, "/products"),
        ]);

        if (!cancelled) {
          setContacts(loadedContacts);
          setProducts(loadedProducts);
        }
      } catch (err) {
        if (!cancelled) {
          setContacts([]);
          setProducts([]);
          setCatalogError(
            err instanceof ApiError ? err.message : "Failed to load catalog",
          );
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  function handleOrderCreated(_order: Order) {
    setOrdersRefreshKey((value) => value + 1);
  }

  return (
    <main className="page">
      <header>
        <h1>Artos Partner Orders</h1>
        <p className="muted">Submit bakery orders to the Artos REST API.</p>
      </header>

      <section className="card">
        <label>
          API key
          <input
            type="text"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="dev-artos-key"
            autoComplete="off"
          />
        </label>
        {catalogLoading && <p className="muted">Loading catalog…</p>}
        {catalogError && <p className="error">{catalogError}</p>}
      </section>

      <div className="grid">
        <OrderForm
          apiKey={apiKey}
          contacts={contacts}
          products={products}
          onCreated={handleOrderCreated}
        />
        <OrdersList apiKey={apiKey} refreshKey={ordersRefreshKey} />
      </div>
    </main>
  );
}
