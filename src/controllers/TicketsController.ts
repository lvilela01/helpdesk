import { Request, Response } from "express";
import { uuid, z } from "zod";
import { AppError } from "@/utils/AppError";
import { DiskStorage } from "@/providers/disk-storage";
import uploadConfig from "@/configs/upload";
import { prisma } from "@/database/prisma";

export class TicketsController {
  async create(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const bodySchema = z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      category: z.string().trim().min(1),
      coach: z.string().trim().min(1),
    });

    const { title, description, category, coach } = bodySchema.parse(req.body);

    const service = await prisma.service.findUnique({
      where: { category, active: true },
      select: {
        id: true,
        amount: true,
      },
    });

    if (!service) {
      throw new AppError("Service category not found or inactive", 404);
    }

    const coachExisting = await prisma.account.findFirst({
      where: { role: "coach", user: { is: { name: coach } } },
      select: { user: { select: { name: true } } },
    });

    if (!coachExisting?.user) {
      throw new AppError("Coach not found", 404);
    }

    const client = await prisma.client.findUnique({
      where: { accountId: req.user.id },
      select: { id: true },
    });

    if (!client) {
      throw new AppError("Client profile not found", 404);
    }

    const diskStorage = new DiskStorage();
    let filename: string | undefined;

    if (req.file) {
      /*
          z.looseObject valida as propriedades declaradas e permite propriedades adicionais no objeto, mantendo-as no resultado. É semelhante ao comportamento de .passthrough().
        */
      const fileSchema = z.looseObject({
        filename: z.string().min(1),
        mimetype: z
          .string()
          .refine(
            (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
            `Formato de arquivo inválido! Formatos permitidos: ${uploadConfig.ACCEPTED_IMAGE_TYPES}`,
          ),
        size: z
          .number()
          .positive()
          .refine(
            (size) => size <= uploadConfig.MAX_FILE_SIZE,
            `Arquivo excede o tamanho máximo de ${uploadConfig.MAX_SIZE_MB} MB.`,
          ),
      });

      const file = fileSchema.parse(req.file);
      filename = await diskStorage.saveFile(file.filename);
    }

    try {
      const ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          serviceId: service.id,
          amount: service.amount,
          clientId: client.id,
          attachment: filename,
          coach: coachExisting.user.name,
        },
      });

      return res.status(201).json(ticket);
    } catch (error) {
      if (filename) {
        await diskStorage.deleteFile(filename, "upload");
      }

      throw error;
    }
  }

  async index(_req: Request, res: Response) {
    const ticketsList = await prisma.ticket.findMany({
      where: { status: { in: ["open", "being_served"] } },
      select: {
        title: true,
        description: true,
        amount: true,
        attachment: true,
        status: true,
        service: { select: { name: true, category: true } },
        updatedAt: true,
      },
    });

    return res.json(ticketsList);
  }

  async ticketsCoach(req: Request, res: Response) {
    const { id } = z
      .object({
        id: uuid(),
      })
      .parse(req.params);

    const coach = await prisma.account.findFirst({
      where: { id, role: "coach" },
      select: { user: { select: { name: true } } },
    });

    if (!coach?.user) {
      throw new AppError("Coach not found", 404);
    }

    const ticketsList = await prisma.ticket.findMany({
      where: { coach: coach.user.name, status: { in: ["open", "being_served"] } },
      select: {
        id: true,
        title: true,
        description: true,
        amount: true,
        attachment: true,
        status: true,
        service: { select: { name: true, category: true } },
        updatedAt: true,
        additionalServices: true
      },
    });

    return res.json(ticketsList);
  }

  async additionalService(req: Request, res: Response) {
    const { id: ticketId } = z
      .object({
        id: z.uuid(),
      })
      .parse(req.params);

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new AppError("Ticket not found!", 404);
    }

    const { serviceId, quantity } = z
      .object({
        serviceId: z.uuid(),
        quantity: z.coerce.number().int().positive().default(1),
      })
      .parse(req.body);

    const service = await prisma.service.findFirst({
      where: { id: serviceId, active: true },
    });

    if (!service) {
      throw new AppError("Service not found!", 404);
    }

    const addService = await prisma.ticketAdditionalService.create({
      data: {
        ticketId,
        serviceId: service.id,
        amount: service.amount,
        quantity,
      },
    });

    return res.status(201).json(addService);
  }
}
