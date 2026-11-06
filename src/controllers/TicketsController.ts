import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "@/utils/AppError";
import { DiskStorage } from "@/providers/disk-storage";
import uploadConfig from "@/configs/upload";
import { prisma } from "@/database/prisma";
import { ServiceCategory } from "../../generated/prisma/enums"

export class TicketsController {
  async create(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const bodySchema = z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      category: z.enum(ServiceCategory)
    });

    const { title, description, category } = bodySchema.parse(req.body);

    const service = await prisma.service.findUnique({
      where: { category },
      select: {
        id: true,
        amount: true,
      },
    });

    if (!service) {
      throw new AppError("Service category not found", 404);
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
}
