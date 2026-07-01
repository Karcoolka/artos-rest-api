import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import type { DbUser } from "../types/models.js";

export async function findUserByApiKey(apiKey: string): Promise<DbUser | null> {
  const users = await prisma.user.findMany({
    where: { active: true },
  });

  for (const user of users) {
    const matches = await bcrypt.compare(apiKey, user.apiKeyHash);
    if (matches) {
      return user;
    }
  }

  return null;
}
