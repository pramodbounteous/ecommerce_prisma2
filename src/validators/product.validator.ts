import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  productImg: z.string().url(),
  price: z.number().positive(),
  featured: z.boolean().optional()
});