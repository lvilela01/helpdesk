import { Router } from "express";
import { TicketsController } from "@/controllers/TicketsController";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import uploadConfig from "@/configs/upload"
import multer from "multer";

const ticketsRoutes = Router()
const ticketsController = new TicketsController()
const upload = multer(uploadConfig.MULTER)

ticketsRoutes.use(ensureAuthenticated)
ticketsRoutes.post("/", verifyUserAuthorization(["client"]), upload.single("file"), ticketsController.create)

export { ticketsRoutes }
