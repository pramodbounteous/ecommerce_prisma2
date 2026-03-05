"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const auth_validator_1 = require("../validators/auth.validator");
const jwt_1 = require("../utils/jwt");
/*
SIGNUP
*/
const signup = async (req, res) => {
    try {
        const validatedData = auth_validator_1.signupSchema.parse(req.body);
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: validatedData.email }
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(validatedData.password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                role: validatedData.role ?? "BUYER"
            }
        });
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        await prisma_1.default.refreshToken.upsert({
            where: { userId: user.id },
            update: {
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            create: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // change to true in production
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({
            user,
            accessToken
        });
    }
    catch (error) {
        return res.status(400).json({
            error
        });
    }
};
exports.signup = signup;
/*
LOGIN
*/
const login = async (req, res) => {
    try {
        const validatedData = auth_validator_1.loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({
            where: { email: validatedData.email }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const isPasswordValid = await bcrypt_1.default.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const existingRefreshToken = await prisma_1.default.refreshToken.findUnique({
            where: { userId: user.id }
        });
        if (existingRefreshToken) {
            try {
                jsonwebtoken_1.default.verify(existingRefreshToken.token, process.env.REFRESH_TOKEN_SECRET);
            }
            catch {
                await prisma_1.default.refreshToken.delete({
                    where: { userId: user.id }
                });
            }
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        await prisma_1.default.refreshToken.upsert({
            where: { userId: user.id },
            update: {
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            create: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({
            accessToken
        });
    }
    catch (error) {
        return res.status(400).json({
            error
        });
    }
};
exports.login = login;
/*
REFRESH ACCESS TOKEN
*/
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await prisma_1.default.refreshToken.findUnique({
            where: { userId: decoded.userId }
        });
        if (!storedToken || storedToken.token !== refreshToken) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(decoded.userId);
        return res.json({
            accessToken: newAccessToken
        });
    }
    catch (error) {
        return res.status(401).json({
            message: "Refresh token expired. Please login again"
        });
    }
};
exports.refresh = refresh;
/*
LOGOUT
*/
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jsonwebtoken_1.default.decode(refreshToken);
            if (decoded?.userId) {
                await prisma_1.default.refreshToken.deleteMany({
                    where: { userId: decoded.userId }
                });
            }
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "none"
        });
        return res.json({
            message: "Logged out successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Logout failed"
        });
    }
};
exports.logout = logout;
