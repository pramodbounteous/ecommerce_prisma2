"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    quantity: zod_1.z.number().min(1)
});
exports.updateCartSchema = zod_1.z.object({
    quantity: zod_1.z.number().min(1)
});
