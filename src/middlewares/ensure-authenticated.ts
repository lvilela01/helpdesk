import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { AppError } from "@/utils/AppError";
import { authConfig } from "@/configs/auth";
import { prisma } from "@/database/prisma";

interface Tokenpayload {
  role: string;
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
  } catch (error) {
    throw new AppError("Invalid JWT token", 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
    select: {
      id: true,
      role: true,
      mustChangePassword: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = {
    id: user.id,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };

  return next();
}
