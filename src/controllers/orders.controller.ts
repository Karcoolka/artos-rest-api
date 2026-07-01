import type { Request, Response, NextFunction } from "express";
import { toOrderResponse } from "./response.mapper.js";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  listOrdersForUser,
  patchOrder,
} from "../services/order.service.js";
import { idParamSchema } from "../validators/id-param.schema.js";
import {
  createOrderSchema,
  patchOrderSchema,
} from "../validators/create-order.schema.js";

export async function listOrdersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orders = await listOrdersForUser(req.user.id);
    res.json(orders.map(toOrderResponse));
  } catch (error) {
    next(error);
  }
}

export async function getOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const order = await getOrderById(req.user.id, id);
    res.json(toOrderResponse(order));
  } catch (error) {
    next(error);
  }
}

export async function createOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createOrderSchema.parse(req.body);
    const order = await createOrder(req.user.id, input);
    res.status(201).json(toOrderResponse(order));
  } catch (error) {
    next(error);
  }
}

export async function patchOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = patchOrderSchema.parse(req.body);
    const order = await patchOrder(req.user.id, id, input);
    res.json(toOrderResponse(order));
  } catch (error) {
    next(error);
  }
}

export async function deleteOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    await deleteOrder(req.user.id, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
