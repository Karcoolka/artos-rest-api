import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/app-error.js";
import { findUserByApiKey } from "../services/auth.service.js";

const API_KEY_HEADER = "x-api-key";

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const apiKey = req.header(API_KEY_HEADER);

    if (!apiKey) {
      throw new UnauthorizedError("Missing API key");
    }

    const user = await findUserByApiKey(apiKey);

    if (!user) {
      throw new UnauthorizedError();
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
