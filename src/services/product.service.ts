import type { Product } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function listActiveProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}
