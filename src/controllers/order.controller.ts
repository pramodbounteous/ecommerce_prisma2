import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createOrderSchema } from "../validators/order.validator";

/*
CREATE ORDER FROM CART
*/
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const validatedData = createOrderSchema.parse(req.body);

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: true
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    const order = await prisma.order.create({
      data: {
        userId: userId!,
        paymentMethod: validatedData.paymentMethod,
        shippingAddress: validatedData.shippingAddress,
        expectedDelivery
      }
    });

    for (const item of cart.items) {
      await prisma.item.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          orderId: order.id
        }
      });
    }

    await prisma.item.deleteMany({
      where: {
        cartId: cart.id
      }
    });

    return res.json({
      message: "Order created successfully",
      orderId: order.id
    });

  } catch (error) {
    return res.status(400).json({
      error
    });
  }
};

/*
GET USER ORDERS
*/
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return res.json(orders);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
};

/*
GET ORDER BY ID
*/
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.json(order);

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching order"
    });
  }
};