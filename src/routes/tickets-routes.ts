import { Router } from "express";
import { TicketsController } from "@/controllers/TicketsController";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import uploadConfig from "@/configs/upload"
import multer from "multer";

const ticketsRoutes = Router()
const ticketsController = new TicketsController()
const upload = multer(uploadConfig.MULTER)

ticketsRoutes.post("/", ensureAuthenticated, verifyUserAuthorization(["client"]), upload.single("file"), ticketsController.create)

ticketsRoutes.post("/:id/additional-services", ensureAuthenticated, verifyUserAuthorization(["coach"]), ticketsController.additionalService)

ticketsRoutes.get("/", ensureAuthenticated, verifyUserAuthorization(["superadmin", "admin"]), ticketsController.index)

ticketsRoutes.get("/:id/list", ensureAuthenticated, verifyUserAuthorization(["coach"]), ticketsController.ticketsCoach)

export { ticketsRoutes }
