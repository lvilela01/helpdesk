import { UsersController } from "@/controllers/users-controller";
import { Router } from "express";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.use(ensureAuthenticated);
usersRoutes.use(verifyUserAuthorization(["superadmin"]));
usersRoutes.post("/", usersController.create);
usersRoutes.get("/", usersController.index);

export { usersRoutes };
