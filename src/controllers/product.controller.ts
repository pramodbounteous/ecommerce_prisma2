import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createProductSchema } from "../validators/product.validator";

/*
CREATE PRODUCT (SELLER)
*/
export const createProduct = async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        productImg: validatedData.productImg,
        price: validatedData.price
      }
    });

    if (validatedData.featured) {
      await prisma.featured.create({
        data: {
          productId: product.id
        }
      });
    }

    return res.json(product);

  } catch (error) {
    return res.status(400).json({
      error
    });
  }
};

/*
GET ALL PRODUCTS
*/
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        featured: true
      }
    });

    return res.json(products);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products"
    });
  }
};

/*
GET SINGLE PRODUCT
*/
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        featured: true
      }
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    return res.json(product);

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching product"
    });
  }
};

/*
GET FEATURED PRODUCTS (Carousel)
*/
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const featuredProducts = await prisma.featured.findMany({
      include: {
        product: true
      }
    });

    return res.json(featuredProducts);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch featured products"
    });
  }
};