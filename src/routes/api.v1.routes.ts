import { Router } from "express";
import {
  listContactsHandler,
  listProductsHandler,
} from "../controllers/catalog.controller.js";
import {
  createOrderHandler,
  deleteOrderHandler,
  getOrderHandler,
  listOrdersHandler,
  patchOrderHandler,
} from "../controllers/orders.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

// Read-only helpers for building an order
router.get("/contacts", listContactsHandler);
router.get("/products", listProductsHandler);

// CRUD on orders (Create, Read, Update, Delete)
router.get("/orders", listOrdersHandler);
router.get("/orders/:id", getOrderHandler);
router.post("/orders", createOrderHandler);
router.patch("/orders/:id", patchOrderHandler);
router.delete("/orders/:id", deleteOrderHandler);

export default router;
