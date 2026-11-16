import { Router } from "express";
import { ServicesController } from "@/controllers/service-category-controller";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const servicesRoutes = Router()
const servicesController = new ServicesController()

servicesRoutes.use(ensureAuthenticated)
servicesRoutes.use(verifyUserAuthorization(["superadmin", "admin"]))

servicesRoutes.post('/', servicesController.create)
servicesRoutes.get("/", servicesController.index)
servicesRoutes.patch("/:id", servicesController.update)
servicesRoutes.delete("/:id", servicesController.remove)
servicesRoutes.patch("/:id/restore", servicesController.restore)

export { servicesRoutes }
