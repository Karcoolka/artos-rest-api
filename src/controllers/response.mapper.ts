import type { Contact, Product } from "@prisma/client";
import type { OrderWithRelations } from "../services/order.service.js";
import { formatDateOnly } from "../utils/date.js";

export function toContactResponse(contact: Contact) {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
  };
}

export function toProductResponse(product: Product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
  };
}

export function toOrderResponse(order: OrderWithRelations) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    requestedDeliveryDate: formatDateOnly(order.requestedDeliveryDate),
    fulfillment: order.fulfillment,
    notes: order.notes,
    contact: toContactResponse(order.contact),
    items: order.items.map((item) => ({
      productId: item.productId,
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt.toISOString(),
  };
}
