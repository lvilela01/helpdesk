import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";

export class ClientController {
  async create(req: Request, res: Response) {
    const bodySchema = z
      .object({
        name: z.string().min(2),
        email: z.email().trim(),
        password: z.string().min(8, "At least 8 characters!").trim(),
        confirmPassword: z.string().trim(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "The passwords don't match!",
        path: ["confirmPassword"],
      });

    const { name, email, password } = bodySchema.parse(req.body);

    const accountWithSameEmail = await prisma.account.findUnique({
      where: { email },
    });

    if (accountWithSameEmail) {
      throw new AppError("User with same email already exists!");
    }

    const hashedPassword = await hash(password, 12);

    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
        mustChangePassword: false,
        role: "client",
        client: {
          create: { name, avatar: null },
        },
      },
      include: { client: { select: { id: true, name: true } } },
    });

    if (!account.client) {
      throw new AppError(
        "Client profile was not created for this account.",
        500,
      );
    }

    return res.status(201).json({
      id: account.id,
      name: account.client.name,
      email: account.email,
      role: account.role,
    });
  }

  async index(_req: Request, res: Response) {
    const listClient = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        tickets: true,
        account: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.json(listClient);
  }
}
