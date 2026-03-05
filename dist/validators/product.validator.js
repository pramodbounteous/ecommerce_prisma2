"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().min(5),
    productImg: zod_1.z.string().url(),
    price: zod_1.z.number().positive(),
    featured: zod_1.z.boolean().optional()
});
