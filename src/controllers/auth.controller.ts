import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import {
  signupSchema,
  loginSchema
} from "../validators/auth.validator";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt";

/*
SIGNUP
*/
export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role ?? "BUYER"
      }
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.upsert({
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

  } catch (error) {
    return res.status(400).json({
      error
    });
  }
};

/*
LOGIN
*/
export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const existingRefreshToken = await prisma.refreshToken.findUnique({
      where: { userId: user.id }
    });

    if (existingRefreshToken) {
      try {
        jwt.verify(
          existingRefreshToken.token,
          process.env.REFRESH_TOKEN_SECRET as string
        );
      } catch {
        await prisma.refreshToken.delete({
          where: { userId: user.id }
        });
      }
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.upsert({
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

  } catch (error) {
    return res.status(400).json({
      error
    });
  }
};

/*
REFRESH ACCESS TOKEN
*/
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing"
      });
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const storedToken = await prisma.refreshToken.findUnique({
      where: { userId: decoded.userId }
    });

    if (!storedToken || storedToken.token !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const newAccessToken = generateAccessToken(decoded.userId);

    return res.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    return res.status(401).json({
      message: "Refresh token expired. Please login again"
    });
  }
};

/*
LOGOUT
*/
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded: any = jwt.decode(refreshToken);

      if (decoded?.userId) {
        await prisma.refreshToken.deleteMany({
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

  } catch (error) {
    return res.status(500).json({
      message: "Logout failed"
    });
  }
};