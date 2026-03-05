"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/*
CREATE PRODUCT (SELLER ONLY)
*/
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRole)("SELLER"), product_controller_1.createProduct);
/*
GET ALL PRODUCTS
*/
router.get("/", product_controller_1.getProducts);
/*
FEATURED PRODUCTS
*/
router.get("/featured", product_controller_1.getFeaturedProducts);
/*
GET PRODUCT BY ID
*/
router.get("/:id", product_controller_1.getProductById);
exports.default = router;
