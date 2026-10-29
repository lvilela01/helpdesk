import { AdminsController } from "@/controllers/admins-controller";
import { Router } from "express";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const adminsRoutes = Router();
const adminsController = new AdminsController();

adminsRoutes.use(ensureAuthenticated);
adminsRoutes.post(
  "/",
  verifyUserAuthorization(["superadmin"]),
  adminsController.create,
);
adminsRoutes.get(
  "/",
  verifyUserAuthorization(["superadmin"]),
  adminsController.index,
);
adminsRoutes.delete(
  "/:id",
  verifyUserAuthorization(["superadmin"]),
  adminsController.remove,
);

adminsRoutes.patch(
  "/reset-password/:id",
  verifyUserAuthorization(["superadmin", "admin"]),
  adminsController.resetPassword,
);
adminsRoutes.patch(
  "/available-hours/:id",
  verifyUserAuthorization(["superadmin", "admin"]),
  adminsController.update,
);

export { adminsRoutes };
