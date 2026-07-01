import type {
  Contact,
  FulfillmentType,
  Order,
  OrderItem,
  Product,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { NotFoundError, ValidationError } from "../errors/app-error.js";
import { parseDateOnly, startOfTodayUtc } from "../utils/date.js";
import type {
  CreateOrderInput,
  PatchOrderInput,
} from "../validators/create-order.schema.js";

type OrderWithRelations = Order & {
  contact: Contact;
  items: (OrderItem & { product: Product })[];
};

const orderInclude = {
  contact: true,
  items: { include: { product: true } },
} as const;

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const count = await prisma.order.count();
  return `ORD-${year}-${String(count + 1).padStart(5, "0")}`;
}

function assertUniqueProductIds(items: { productId: string }[]): void {
  const productIds = items.map((item) => item.productId);
  if (new Set(productIds).size !== productIds.length) {
    throw new ValidationError("Duplicate products in order items");
  }
}

async function validateOrderItems(items: CreateOrderInput["items"]): Promise<void> {
  assertUniqueProductIds(items);

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  if (products.length !== productIds.length) {
    throw new NotFoundError("One or more products not found or inactive");
  }
}

function validateDeliveryDate(dateString: string): Date {
  const requestedDeliveryDate = parseDateOnly(dateString);
  if (requestedDeliveryDate < startOfTodayUtc()) {
    throw new ValidationError("requestedDeliveryDate cannot be in the past");
  }
  return requestedDeliveryDate;
}

async function getEditableOrder(
  userId: string,
  orderId: string,
): Promise<OrderWithRelations> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.status !== "submitted") {
    throw new ValidationError("Only submitted orders can be changed");
  }

  return order;
}

export async function listOrdersForUser(
  userId: string,
): Promise<OrderWithRelations[]> {
  return prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrder(
  userId: string,
  input: CreateOrderInput,
): Promise<OrderWithRelations> {
  const contact = await prisma.contact.findFirst({
    where: { id: input.contactId, userId },
  });

  if (!contact) {
    throw new NotFoundError("Contact not found");
  }

  await validateOrderItems(input.items);

  const requestedDeliveryDate = validateDeliveryDate(input.requestedDeliveryDate);
  const orderNumber = await generateOrderNumber();

  return prisma.order.create({
    data: {
      orderNumber,
      userId,
      contactId: input.contactId,
      requestedDeliveryDate,
      fulfillment: input.fulfillment as FulfillmentType,
      notes: input.notes,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: orderInclude,
  });
}

export async function getOrderById(
  userId: string,
  orderId: string,
): Promise<OrderWithRelations> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
}

export async function patchOrder(
  userId: string,
  orderId: string,
  input: PatchOrderInput,
): Promise<OrderWithRelations> {
  await getEditableOrder(userId, orderId);

  const data: {
    requestedDeliveryDate?: Date;
    fulfillment?: FulfillmentType;
    notes?: string | null;
  } = {};

  if (input.requestedDeliveryDate !== undefined) {
    data.requestedDeliveryDate = validateDeliveryDate(input.requestedDeliveryDate);
  }

  if (input.fulfillment !== undefined) {
    data.fulfillment = input.fulfillment as FulfillmentType;
  }

  if (input.notes !== undefined) {
    data.notes = input.notes;
  }

  return prisma.order.update({
    where: { id: orderId },
    data,
    include: orderInclude,
  });
}

export async function deleteOrder(
  userId: string,
  orderId: string,
): Promise<void> {
  await getEditableOrder(userId, orderId);
  await prisma.order.delete({ where: { id: orderId } });
}

export type { OrderWithRelations };
