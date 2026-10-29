import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { AppError } from "@/utils/AppError";
import { authConfig } from "@/configs/auth";
import { prisma } from "@/database/prisma";

interface Tokenpayload {
  sub: string;
}

export async function ensureAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT token not found!", 401);
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Invalid authorization header", 401);
  }

  let payload: Tokenpayload;

  try {
    payload = verify(token, authConfig.jwt.secret) as Tokenpayload;

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string"
    ) {
      throw new AppError("Invalid JWT token", 401);
    }
  } catch (error) {
    throw new AppError("Invalid JWT token", 401);
  }

  const account = await prisma.account.findUnique({
    where: {
      id: payload.sub,
    },
    select: {
      id: true,
      role: true,
      user: { select: { name: true } },
      client: { select: { name: true } },
    },
  });

  if (!account) {
    throw new AppError("Account not found", 401);
  }

  const profile = account.user ?? account.client;

  if (!profile) {
    throw new AppError("Account profile not found", 500);
  }

  req.user = {
    id: account.id,
    role: account.role,
    name: profile.name,
  };

  return next();
}
