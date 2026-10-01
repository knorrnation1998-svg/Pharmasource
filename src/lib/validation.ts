import { z } from "zod";

export const productSchema = z.object({
  inn: z.string().min(2, "INN is required"),
  brandName: z.string().trim().nullable().catch(null),
  category: z.enum([
    "rare-drug",
    "specialised-injection",
    "diagnostic-reagent",
    "cold-chain-biologic",
  ]),
  presentation: z.string().min(2, "Give the vial or pack presentation"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  origin: z.enum(["US", "FR", "DE", "CH", "BE", "UK", "NL"]),
  hsCode: z
    .string()
    .regex(/^\d{4}\.\d{2}\.\d{2}$/, "HS code must look like 3002.12.00"),
  coldChain: z.enum(["ambient", "2-8C", "-20C", "-70C"]),
  priceXaf: z.coerce.number().int().positive("Price must be above zero"),
  stockQty: z.coerce.number().int().min(0),
  reorderLevel: z.coerce.number().int().min(0),
  requiresPrescription: z.coerce.boolean(),
  minsanteRef: z.string().trim().nullable().catch(null),
  leadTimeDays: z.coerce.number().int().min(1).max(180),
  description: z.string().min(10, "Describe the indication in a sentence"),
  imageUrl: z.string().url().nullable().catch(null),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  delta: z.coerce.number().int(),
});

export const priceAdjustmentSchema = z.object({
  productId: z.string().min(1),
  priceXaf: z.coerce.number().int().positive(),
});

export const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ProductInput = z.infer<typeof productSchema>;
