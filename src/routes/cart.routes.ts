import { Router } from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
} from "../controllers/cart.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/*
ADD PRODUCT TO CART
*/
router.post("/", authenticate, addToCart);

/*
GET USER CART
*/
router.get("/", authenticate, getCart);

/*
UPDATE CART ITEM
*/
router.patch("/:itemId", authenticate, updateCartItem);

/*
REMOVE ITEM
*/
router.delete("/:itemId", authenticate, removeCartItem);

export default router;