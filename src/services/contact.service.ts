import type { Contact } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function listContactsForUser(userId: string): Promise<Contact[]> {
  return prisma.contact.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}
