import type { DbUser } from "./models.js";

declare global {
  namespace Express {
    interface Request {
      user: DbUser;
    }
  }
}

export {};
