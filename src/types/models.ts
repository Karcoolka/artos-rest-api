import type { Prisma } from "@prisma/client";

export type DbUser = Prisma.UserGetPayload<Record<string, never>>;
export type DbContact = Prisma.ContactGetPayload<Record<string, never>>;
export type DbProduct = Prisma.ProductGetPayload<Record<string, never>>;
