"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturedProducts = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const product_validator_1 = require("../validators/product.validator");
/*
CREATE PRODUCT (SELLER)
*/
const createProduct = async (req, res) => {
    try {
        const validatedData = product_validator_1.createProductSchema.parse(req.body);
        const product = await prisma_1.default.product.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                productImg: validatedData.productImg,
                price: validatedData.price
            }
        });
        if (validatedData.featured) {
            await prisma_1.default.featured.create({
                data: {
                    productId: product.id
                }
            });
        }
        return res.json(product);
    }
    catch (error) {
        return res.status(400).json({
            error
        });
    }
};
exports.createProduct = createProduct;
/*
GET ALL PRODUCTS
*/
const getProducts = async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: {
                featured: true
            }
        });
        return res.json(products);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch products"
        });
    }
};
exports.getProducts = getProducts;
/*
GET SINGLE PRODUCT
*/
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await prisma_1.default.product.findUnique({
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching product"
        });
    }
};
exports.getProductById = getProductById;
/*
GET FEATURED PRODUCTS (Carousel)
*/
const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await prisma_1.default.featured.findMany({
            include: {
                product: true
            }
        });
        return res.json(featuredProducts);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch featured products"
        });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
