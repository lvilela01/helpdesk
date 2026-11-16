import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response } from "express";
import z from "zod";

export class ServicesController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(1),
      category: z.string().trim().min(1),
      amount: z.coerce
        .number()
        .positive()
        .refine(
          (value) => Number.isInteger(value * 100),
          "Amount must have at most 2 decimal places",
        ),
    });

    const { name, category, amount } = bodySchema.parse(req.body);

    const existingService = await prisma.service.findFirst({
      where: { OR: [{ name }, { category }] },
      select: {
        name: true,
        category: true,
      },
    });

    if (existingService) {
      throw new AppError("Name or category already exists", 409);
    }

    const data = await prisma.service.create({
      data: {
        name,
        category,
        amount,
      },
    });

    return res
      .status(201)
      .json({ message: "Service created successfully!", service: data });
  }

  async index(_req: Request, res: Response) {
    const serviceList = await prisma.service.findMany({
      select: {
        name: true,
        category: true,
        active: true,
        amount: true,
        tickets: {
          select: {
            description: true,
            updatedAt: true,
            status: true,
          },
        },
      },
    });

    return res.json(serviceList);
  }

  async update(req: Request, res: Response) {
    const { id } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    const { amount } = z
      .object({
        amount: z.coerce
          .number()
          .positive()
          .refine(
            (value) => Number.isInteger(value * 100),
            "Amount must have at most 2 decimal places",
          ),
      })
      .parse(req.body);

    const updatedService = await prisma.service.update({
      where: { id },
      data: { amount },
    });

    return res.json({
      message: "New price updated successfully!",
      service: updatedService,
    });
  }

  async remove(req: Request, res: Response) {
    const { id } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const service = await prisma.service.findUnique({
      where: { id },
      select: { id: true, active: true },
    });

    if (!service) {
      throw new AppError("Service not found!", 404);
    }

    if (!service.active) {
      throw new AppError("Service is already inactive", 400);
    }

    await prisma.service.update({
      where: { id },
      data: { active: false },
    });

    return res.status(204).send();
  }

  async restore(req: Request, res: Response) {
    const { id } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError("Service not found!", 404);
    }

    await prisma.service.update({
      where: { id },
      data: { active: true },
    });

    return res.json({ message: "Service restored successfully!" });
  }
}
