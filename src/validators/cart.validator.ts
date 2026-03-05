import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1)
});

export const updateCartSchema = z.object({
  quantity: z.number().min(1)
});