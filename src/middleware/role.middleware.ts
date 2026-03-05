import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "./auth.middleware";

export const authorizeRole = (role: "BUYER" | "SELLER") => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized"
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.role !== role) {
        return res.status(403).json({
          message: "Forbidden: insufficient permissions"
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        message: "Authorization error"
      });
    }
  };
};