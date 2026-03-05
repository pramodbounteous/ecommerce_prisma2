import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getFeaturedProducts
} from "../controllers/product.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";

const router = Router();

/*
CREATE PRODUCT (SELLER ONLY)
*/
router.post(
  "/",
  authenticate,
  authorizeRole("SELLER"),
  createProduct
);

/*
GET ALL PRODUCTS
*/
router.get("/", getProducts);

/*
FEATURED PRODUCTS
*/
router.get("/featured", getFeaturedProducts);

/*
GET PRODUCT BY ID
*/
router.get("/:id", getProductById);

export default router;