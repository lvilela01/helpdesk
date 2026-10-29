import { Request, Response } from "express";
import { z } from "zod";
import { compare, hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

export class ChangePasswordController {
  async update(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const updateSchema = z
      .object({
        password: z.string().trim().min(8),
        newPassword: z.string().trim().min(8),
        confirmPassword: z.string().trim(),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "The passwords don't match!",
        path: ["confirmPassword"],
      });

    const { password, newPassword } = updateSchema.parse(req.body);

    const account = await prisma.account.findUnique({
      where: { id: req.user.id },
      select: {
        password: true,
        passwordTemporary: true,
        mustChangePassword: true,
        role: true,
      },
    });

    if (!account) {
      throw new AppError("Account not found", 404);
    }

    const storedPassword =
      account.role === "coach" && account.mustChangePassword
        ? account.passwordTemporary
        : account.password;

    if (!storedPassword) {
      throw new AppError("Current password is not configured", 400);
    }

    const passwordMatched = await compare(password, storedPassword);

    if (!passwordMatched) {
      throw new AppError("Current password is invalid", 401);
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.account.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
        passwordTemporary: null,
        mustChangePassword: false,
      },
    });

    return res.json("Password updated successfully!");
  }
}
