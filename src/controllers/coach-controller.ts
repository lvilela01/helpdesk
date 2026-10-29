import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";
import { Request, Response } from "express";
import z from "zod";
import { defaultHours, hourSchema } from "@/utils/defaultHours";

export class CoachController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(3).trim(),
      email: z.email().trim(),
      passwordTemporary: z.string().min(8),
      availableHours: z.array(hourSchema).default(defaultHours),
    });

    const { name, email, passwordTemporary, availableHours } = bodySchema.parse(
      req.body,
    );

    const userWithSameEmail = await prisma.account.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("This email address is already in use!", 400);
    }

    const hashedPassword = await hash(passwordTemporary, 12);

    const account = await prisma.account.create({
      data: {
        email,
        passwordTemporary: hashedPassword,
        role: "coach" as const,
        mustChangePassword: true,
        user: {
          create: { name, availableHours },
        },
      },
      include: {
        user: true,
      },
    });

    return res.status(201).json({
      id: account.id,
      email: account.email,
      role: account.role,
      mustChangePassword: account.mustChangePassword,
    });
  }

  async index(_req: Request, res: Response) {
    const listCoach = await prisma.user.findMany({
      where: { account: { role: "coach" } },
      select: {
        id: true,
        name: true,
        availableHours: true,
        account: {
          select: {
            id: true,
            email: true,
            role: true,
            mustChangePassword: true,
          },
        },
      },
    });

    return res.json(listCoach);
  }

  async update(req: Request, res: Response) {
    const { id } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const { availableHours } = z
      .object({
        availableHours: z.array(hourSchema).optional(),
      })
      .parse(req.body);

    if (availableHours === undefined) {
      throw new AppError("At least one field must be provided", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id, account: { role: "coach" } },
      select: {
        accountId: true,
      },
    });

    if (!user) {
      throw new AppError("Coach not found", 404);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          ...(availableHours !== undefined && { availableHours }),
        },
      }),
    ]);

    return res.json({ message: "Hours updated!" });
  }
}
