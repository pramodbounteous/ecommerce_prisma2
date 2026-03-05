import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { addToCartSchema, updateCartSchema } from "../validators/cart.validator";

/*
ADD PRODUCT TO CART
*/
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const validatedData = addToCartSchema.parse(req.body);

    let cart = await prisma.cart.findFirst({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId!
        }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const totalPrice = product.price * validatedData.quantity;

    const item = await prisma.item.create({
      data: {
        productId: product.id,
        quantity: validatedData.quantity,
        totalPrice,
        cartId: cart.id
      }
    });

    return res.json(item);

  } catch (error) {
    return res.status(400).json({
      error
    });
  }
};

/*
GET CART ITEMS
*/
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.json(cart);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch cart"
    });
  }
};

/*
UPDATE CART ITEM QUANTITY
*/
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemId = req.params.itemId as string;

    const validatedData = updateCartSchema.parse(req.body);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        product: true
      }
    });

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    const totalPrice = item.product.price * validatedData.quantity;

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        quantity: validatedData.quantity,
        totalPrice
      }
    });

    return res.json(updatedItem);

  } catch (error) {
    return res.status(400).json({
      error
    });
  }
};

/*
REMOVE ITEM FROM CART
*/
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemId = req.params.itemId as string;

    await prisma.item.delete({
      where: { id: itemId }
    });

    return res.json({
      message: "Item removed from cart"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove item"
    });
  }
};