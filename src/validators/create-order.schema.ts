import { z } from "zod";

export const createOrderSchema = z.object({
  contactId: z.string().uuid(),
  requestedDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date (YYYY-MM-DD)"),
  fulfillment: z.enum(["pickup", "delivery"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "At least one item is required"),
  notes: z.string().trim().optional(),
});

export const patchOrderSchema = z
  .object({
    requestedDeliveryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date (YYYY-MM-DD)")
      .optional(),
    fulfillment: z.enum(["pickup", "delivery"]).optional(),
    notes: z.string().trim().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PatchOrderInput = z.infer<typeof patchOrderSchema>;
