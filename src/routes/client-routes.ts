import { Router } from "express";
import { ClientController } from "@/controllers/client-controllers";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const clientsRoutes = Router();
const clientsController = new ClientController();

clientsRoutes.post("/register", clientsController.create);
clientsRoutes.get(
  "/list",
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "superadmin", "coach"]),
  clientsController.index,
);

export { clientsRoutes };
