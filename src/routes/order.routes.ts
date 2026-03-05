import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById
} from "../controllers/order.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/*
CREATE ORDER
*/
router.post("/", authenticate, createOrder);

/*
GET USER ORDERS
*/
router.get("/", authenticate, getOrders);

/*
GET ORDER BY ID
*/
router.get("/:id", authenticate, getOrderById);

export default router;