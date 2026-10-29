import { Router } from "express";
import { UploadsController } from "@/controllers/uploads-controller";
import multer from "multer";
import uploadConfig from "@/configs/upload";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const uploadsRoutes = Router();
const uploadsController = new UploadsController();
const upload = multer(uploadConfig.MULTER);

uploadsRoutes.use(ensureAuthenticated);
uploadsRoutes.post(
  "/ticket",
  upload.single("file"),
  uploadsController.createTicket,
);
uploadsRoutes.post(
  "/avatar",
  upload.single("file"),
  uploadsController.createAvatar,
);
// single se refere a um único arquivo e file o nome do campo que recupera esse arquivo.

export { uploadsRoutes };
