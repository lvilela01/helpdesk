import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { AppError } from "@/utils/AppError";
import uploadConfig from "@/configs/upload";
import { DiskStorage } from "@/providers/disk-storage";
import { prisma } from "@/database/prisma";

class UploadsController {
  async createTicket(req: Request, res: Response, _next: NextFunction) {
    const diskStorage = new DiskStorage();

    try {
      /*
        z.looseObject valida as propriedades declaradas e permite propriedades adicionais no objeto, mantendo-as no resultado. É semelhante ao comportamento de .passthrough().
      */
      const fileSchema = z.looseObject({
        filename: z.string().min(1, "Arquivo é obrigatório"),
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
      const filename = await diskStorage.saveFile(file.filename);

      res.status(201).json({ filename });
    } catch (error) {
      if (error instanceof ZodError) {
        if (req.file) {
          await diskStorage.deleteFile(req.file.filename, "tmp");
        }

        throw new AppError(error.issues[0].message);
      }

      throw error;
    }
  }

  async createAvatar(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const diskStorage = new DiskStorage();

    try {
      const fileSchema = z.object({
        filename: z.string(),
        mimetype: z
          .string()
          .refine(
            (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
            "Formato de arquivo inválido",
          ),
        size: z
          .number()
          .positive()
          .max(
            uploadConfig.MAX_FILE_SIZE,
            `Arquivo excede o tamanho máximo de ${uploadConfig.MAX_SIZE_MB} MB.`,
          ),
      });

      const file = fileSchema.parse(req.file);

      const account = await prisma.account.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          avatar: true,
        },
      });

      if (!account) {
        throw new AppError("Account not found", 404);
      }

      const oldAvatar = account.avatar

      const filename = await diskStorage.saveFile(file.filename);

      try {
        await prisma.account.update({
          where: {
            id: req.user.id,
          },
          data: {
            avatar: filename,
          },
        })
      } catch (error) {
        await diskStorage.deleteFile(filename, "upload");
        throw error;
      }

      if (oldAvatar) {
        await diskStorage.deleteFile(oldAvatar, "upload")
      }

      return res.status(201).json({ filename });
    } catch (error) {
      if (error instanceof ZodError) {
        if (req.file) {
          await diskStorage.deleteFile(req.file.filename, "tmp");
        }

        throw new AppError(error.issues[0].message);
      }
      throw error;
    }
  }
}

export { UploadsController };
