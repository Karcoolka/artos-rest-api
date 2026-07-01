export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
};

export type OrderItem = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  requestedDeliveryDate: string;
  fulfillment: "pickup" | "delivery";
  notes: string | null;
  contact: Contact;
  items: OrderItem[];
  createdAt: string;
};

export type CreateOrderPayload = {
  contactId: string;
  requestedDeliveryDate: string;
  fulfillment: "pickup" | "delivery";
  items: { productId: string; quantity: number }[];
  notes?: string;
};

export type OrderLineDraft = {
  productId: string;
  quantity: number;
};
