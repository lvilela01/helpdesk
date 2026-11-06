import { Router } from "express";
import { ClientsController } from "@/controllers/clients-controllers";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const clientsRoutes = Router();
const clientsController = new ClientsController();

clientsRoutes.post(
  "/register",
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "superadmin"]),
  clientsController.create,
);
clientsRoutes.get(
  "/list",
  ensureAuthenticated,
  verifyUserAuthorization(["admin", "superadmin", "coach"]),
  clientsController.index,
);

export { clientsRoutes };
