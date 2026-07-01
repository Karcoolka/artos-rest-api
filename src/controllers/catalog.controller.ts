import type { Request, Response, NextFunction } from "express";
import { toContactResponse, toProductResponse } from "./response.mapper.js";
import { listContactsForUser } from "../services/contact.service.js";
import { listActiveProducts } from "../services/product.service.js";

export async function listContactsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const contacts = await listContactsForUser(req.user.id);
    res.json(contacts.map(toContactResponse));
  } catch (error) {
    next(error);
  }
}

export async function listProductsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const products = await listActiveProducts();
    res.json(products.map(toProductResponse));
  } catch (error) {
    next(error);
  }
}
