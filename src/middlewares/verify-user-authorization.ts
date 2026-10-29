import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { UserRole } from "../../generated/prisma/enums";

export function verifyUserAuthorization(role: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!role.includes(request.user.role)) {
      throw new AppError("Unauthorized", 401);
    }

    return next();
  };
}
