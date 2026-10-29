import { authConfig } from "@/configs/auth";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { compare } from "bcrypt";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { z } from "zod";

export class SessionsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z.email().trim(),
      password: z.string().trim(),
    });

    const { email, password } = bodySchema.parse(req.body);

    const account = await prisma.account.findUnique({
      where: { email },
      include: {
        user: { select: { name: true } },
        client: { select: { name: true } },
      },
    });

    if (!account) {
      throw new AppError("Email or password invalid!", 401);
    }

    const storedPassword =
      account.role === "coach" && account.mustChangePassword
        ? account.passwordTemporary
        : account.password;

    if (!storedPassword) {
      throw new AppError("Email or password invalid!", 401);
    }

    const passwordMatched = await compare(password, storedPassword);

    if (!passwordMatched) {
      throw new AppError("Email or password invalid!", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const profile = account.user ?? account.client;

    if (!profile) {
      throw new AppError("Account profile not found", 500);
    }

    const hasUser = Boolean(account.user);
    const hasClient = Boolean(account.client);

    const validProfile =
      account.role === "client" ? hasClient && !hasUser : hasUser && !hasClient;

    if (!validProfile) {
      throw new AppError("Invalid account profile!", 500);
    }

    const token = sign({ role: account.role }, secret, {
      subject: account.id,
      expiresIn,
    });

    return res.json({
      token,
      user: {
        id: account.id,
        name: profile.name,
        email: account.email,
        role: account.role,
        mustChangePassword:
          account.role === "coach" && account.mustChangePassword,
      },
    });
  }
}
