import { Request, Response } from "express";
import { uuid, z } from "zod";
import { AppError } from "@/utils/AppError";
import { prisma } from "@/database/prisma";
import { hash } from "bcrypt";
import { hourSchema } from "@/utils/defaultHours";

export class AdminsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().min(3),
      email: z.email().trim(),
      password: z.string().min(8).trim(),
      role: z.enum(["admin", "coach"]),
    });

    const { name, email, password, role } = bodySchema.parse(req.body);

    const userWithSameEmail = await prisma.account.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("User with same email already exists!");
    }

    const hashedPassword = await hash(password, 12);

    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
        role,
        user: {
          create: { name },
        },
      },
      include: {
        user: true,
      },
    });

    if (!account.user) {
      throw new AppError("User profile was not created for this account.", 500);
    }

    return res.status(201).json({
      id: account.id,
      name: account.user.name,
      email: account.email,
      role: account.role,
    });
  }

  async index(_req: Request, res: Response) {
    const adminsList = await prisma.account.findMany({
      where: { role: { in: ["admin", "superadmin"] } },
      select: {
        id: true,
        email: true,
        role: true,
        mustChangePassword: true,
        user: {
          select: { name: true, availableHours: true },
        },
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

    const { availableHours } = z
      .object({
        availableHours: z.array(hourSchema),
      })
      .parse(req.body);

    const account = await prisma.account.findUnique({
      where: { id },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!account) {
      throw new AppError("User not found!", 404);
    }

    if (!account.user) {
      throw new AppError("User profile not found!", 404);
    }

    await prisma.user.update({
      where: { id: account.user.id },
      data: { availableHours },
    });

    return res.json({ message: "Available hours updated!" });
  }

  async remove(req: Request, res: Response) {
    const { id } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const account = await prisma.account.findUnique({
      where: { id },
      select: { user: { select: { _count: { select: { clients: true } } } } },
    });

    if (!account) {
      throw new AppError("User not found", 404);
    }

    if (req.user?.id === id) {
      throw new AppError("You cannot delete your own user", 400);
    }

    if ((account.user?._count.clients ?? 0) > 0) {
      throw new AppError(
        "This user cannot be deleted because it has associated clients",
        400,
      );
    }

    if (!account.user) {
      throw new AppError("User profile not found!", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({
        where: { accountId: id },
      });

      await tx.account.delete({
        where: { id },
      });
    });

    return res.status(204).send();
  }

  async resetPassword(req: Request, res: Response) {
    const { id } = z
      .object({
        id: uuid(),
      })
      .parse(req.params);

    const { newPassword } = z
      .object({
        newPassword: z.string().trim().min(8),
      })
      .parse(req.body);

    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const targetAccount = await prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!targetAccount) {
      throw new AppError("Account not found", 404);
    }

    if (req.user.id === targetAccount.id) {
      throw new AppError(
        "Use the regular password change endpoint for your own account",
        400,
      );
    }

    if (
      req.user.role === "admin" &&
      !["coach", "client"].includes(targetAccount.role)
    ) {
      throw new AppError(
        "Admins cannot reset passwords for admin or superadmin accounts",
        403,
      );
    }

    const hashedPassword = await hash(newPassword, 12);

    const data =
      targetAccount.role === "coach"
        ? {
            password: null,
            passwordTemporary: hashedPassword,
            mustChangePassword: true,
          }
        : {
            password: hashedPassword,
            passwordTemporary: null,
            mustChangePassword: false,
          };

    await prisma.account.update({
      where: { id: targetAccount.id },
      data,
    });

    return res.json("Password updated successfully!");
  }
}
