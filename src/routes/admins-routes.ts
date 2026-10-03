import { AdminsController } from "@/controllers/admins-controller";
import { Router } from "express";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const adminsRoutes = Router();
const usersController = new AdminsController();

adminsRoutes.use(ensureAuthenticated);
adminsRoutes.use(verifyUserAuthorization(["superadmin"]));
adminsRoutes.post("/", usersController.create);
adminsRoutes.get("/", usersController.index);
adminsRoutes.patch("/:id", usersController.update);
adminsRoutes.delete("/:id", usersController.remove);

export { adminsRoutes };
