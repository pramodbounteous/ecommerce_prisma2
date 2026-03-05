"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const order_validator_1 = require("../validators/order.validator");
/*
CREATE ORDER FROM CART
*/
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const validatedData = order_validator_1.createOrderSchema.parse(req.body);
        const cart = await prisma_1.default.cart.findFirst({
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
        const order = await prisma_1.default.order.create({
            data: {
                userId: userId,
                paymentMethod: validatedData.paymentMethod,
                shippingAddress: validatedData.shippingAddress,
                expectedDelivery
            }
        });
        for (const item of cart.items) {
            await prisma_1.default.item.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    orderId: order.id
                }
            });
        }
        await prisma_1.default.item.deleteMany({
            where: {
                cartId: cart.id
            }
        });
        return res.json({
            message: "Order created successfully",
            orderId: order.id
        });
    }
    catch (error) {
        return res.status(400).json({
            error
        });
    }
};
exports.createOrder = createOrder;
/*
GET USER ORDERS
*/
const getOrders = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const orders = await prisma_1.default.order.findMany({
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
};
exports.getOrders = getOrders;
/*
GET ORDER BY ID
*/
const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await prisma_1.default.order.findUnique({
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching order"
        });
    }
};
exports.getOrderById = getOrderById;
