import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "@/utils/AppError";
import { prisma } from "@/database/prisma";
import { hash } from "bcrypt";

export class AdminsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.email().trim(),
      password: z.string().min(8).trim(),
      role: z.enum(["admin", "coach"]),
    });

    const { name, email, password, role } = bodySchema.parse(req.body);

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("User with same email already exists!");
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  async index(_req: Request, res: Response) {
    const adminsList = await prisma.user.findMany({
      where: { role: { in: ["admin", "superadmin"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(adminsList);
  }

  async update(req: Request, res: Response) {
    const { id } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const updateSchema = z.object({
      email: z.email().optional(),
      password: z.string().optional(),
      passwordTemporary: z.string().optional(),
      mustChangePassword: z.boolean().optional(),
      role: z.enum(["coach", "admin", "superadmin"]).optional(),
    });

    const { email, password, mustChangePassword, passwordTemporary, role } =
      updateSchema.parse(req.body);

    const hashedPassword = password ? await hash(password, 12) : undefined;

    const data = {
      ...(email !== undefined && { email }),
      ...(password !== undefined && { password: hashedPassword }),
      ...(mustChangePassword !== undefined && { mustChangePassword }),
      ...(role !== undefined && { role }),
      ...(passwordTemporary !== undefined && { passwordTemporary }),
    };

    await prisma.user.update({
      where: { id },
      data,
    });

    return res.json({ message: "Updated!" });
  }

  async remove(req: Request, res: Response) {
    const { id } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const user = await prisma.user.findUnique({
      where: { id },
      select: { _count: { select: { clients: true } } },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (req.user?.id === id) {
      throw new AppError("You cannot delete your own user", 400);
    }

    if (user._count.clients > 0) {
      throw new AppError(
        "This user cannot be deleted because it has associated clients",
        400,
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(204).send();
  }
}
