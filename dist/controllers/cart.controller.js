"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCartItem = exports.updateCartItem = exports.getCart = exports.addToCart = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const cart_validator_1 = require("../validators/cart.validator");
/*
ADD PRODUCT TO CART
*/
const addToCart = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const validatedData = cart_validator_1.addToCartSchema.parse(req.body);
        let cart = await prisma_1.default.cart.findFirst({
            where: { userId }
        });
        if (!cart) {
            cart = await prisma_1.default.cart.create({
                data: {
                    userId: userId
                }
            });
        }
        const product = await prisma_1.default.product.findUnique({
            where: { id: validatedData.productId }
        });
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        const totalPrice = product.price * validatedData.quantity;
        const item = await prisma_1.default.item.create({
            data: {
                productId: product.id,
                quantity: validatedData.quantity,
                totalPrice,
                cartId: cart.id
            }
        });
        return res.json(item);
    }
    catch (error) {
        return res.status(400).json({
            error
        });
    }
};
exports.addToCart = addToCart;
/*
GET CART ITEMS
*/
const getCart = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const cart = await prisma_1.default.cart.findFirst({
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch cart"
        });
    }
};
exports.getCart = getCart;
/*
UPDATE CART ITEM QUANTITY
*/
const updateCartItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const validatedData = cart_validator_1.updateCartSchema.parse(req.body);
        const item = await prisma_1.default.item.findUnique({
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
        const updatedItem = await prisma_1.default.item.update({
            where: { id: itemId },
            data: {
                quantity: validatedData.quantity,
                totalPrice
            }
        });
        return res.json(updatedItem);
    }
    catch (error) {
        return res.status(400).json({
            error
        });
    }
};
exports.updateCartItem = updateCartItem;
/*
REMOVE ITEM FROM CART
*/
const removeCartItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        await prisma_1.default.item.delete({
            where: { id: itemId }
        });
        return res.json({
            message: "Item removed from cart"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to remove item"
        });
    }
};
exports.removeCartItem = removeCartItem;
