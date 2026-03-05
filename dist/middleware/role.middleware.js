"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const authorizeRole = (role) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId }
            });
            if (!user || user.role !== role) {
                return res.status(403).json({
                    message: "Forbidden: insufficient permissions"
                });
            }
            next();
        }
        catch (error) {
            return res.status(500).json({
                message: "Authorization error"
            });
        }
    };
};
exports.authorizeRole = authorizeRole;
