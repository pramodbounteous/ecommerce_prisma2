"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    paymentMethod: zod_1.z.string().min(2),
    shippingAddress: zod_1.z.string().min(5)
});
