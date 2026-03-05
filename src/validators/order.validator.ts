import { z } from "zod";

export const createOrderSchema = z.object({
  paymentMethod: z.string().min(2),
  shippingAddress: z.string().min(5)
});