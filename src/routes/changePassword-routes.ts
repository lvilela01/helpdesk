import { Router } from "express";
import { ChangePasswordController } from "@/controllers/changePassword-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const changePasswordRoutes = Router();
const changePasswordController = new ChangePasswordController();

changePasswordRoutes.patch(
  "/",
  ensureAuthenticated,
  changePasswordController.update,
);

export { changePasswordRoutes };
