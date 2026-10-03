import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";
import { Request, Response } from "express";
import z from "zod";

export class CoachController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(3).trim(),
      email: z.email().trim(),
      passwordTemporary: z.string().min(8),
    });

    const { name, email, passwordTemporary } = bodySchema.parse(req.body);

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("This email address is already in use!", 400);
    }

    const hashedPassword = await hash(passwordTemporary, 12);

    const data = {
      name,
      email,
      passwordTemporary: hashedPassword,
      role: "coach" as const,
      mustChangePassword: true,
    };

    const coach = await prisma.user.create({
      data,
    });

    return res.status(201).json({
      id: coach.id,
      name: coach.name,
      email: coach.email,
      role: coach.role,
      mustChangePassword: coach.mustChangePassword,
    });
  }

  async changePassword(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { password } = z
      .object({
        password: z.string().trim().min(8),
      })
      .parse(req.body);

    const newPasswordHash = await hash(password, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: newPasswordHash,
        passwordTemporary: null,
        mustChangePassword: false,
      },
    });

    return res.json({ message: "Password updated successfully!" });
  }

  async index(_req: Request, res: Response) {
    const listCoach = await prisma.user.findMany({
      where: { role: "coach" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
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

    const updateSchema = z.object({
      email: z.email().optional(),
      passwordTemporary: z.string().trim().min(8).optional(),
    });

    const { email, passwordTemporary } = updateSchema.parse(req.body);

    if (email === undefined && passwordTemporary === undefined) {
      throw new AppError("At least one field must be provided", 400);
    }

    const data = {
      ...(email !== undefined && { email }),
      ...(passwordTemporary !== undefined && {
        passwordTemporary: await hash(passwordTemporary, 12),
        password: null,
        mustChangePassword: true,
      }),
    };

    await prisma.user.update({
      where: { id },
      data,
    });

    return res.json({ message: "Updated!" });
  }
}
