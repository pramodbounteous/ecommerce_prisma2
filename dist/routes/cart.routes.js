"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/*
ADD PRODUCT TO CART
*/
router.post("/", auth_middleware_1.authenticate, cart_controller_1.addToCart);
/*
GET USER CART
*/
router.get("/", auth_middleware_1.authenticate, cart_controller_1.getCart);
/*
UPDATE CART ITEM
*/
router.patch("/:itemId", auth_middleware_1.authenticate, cart_controller_1.updateCartItem);
/*
REMOVE ITEM
*/
router.delete("/:itemId", auth_middleware_1.authenticate, cart_controller_1.removeCartItem);
exports.default = router;
