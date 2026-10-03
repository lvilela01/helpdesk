import { Router } from "express";
import { CoachController } from "@/controllers/coach-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const coachRoutes = Router();
const coachController = new CoachController();

coachRoutes.use(ensureAuthenticated);

coachRoutes.post(
  "/",
  verifyUserAuthorization(["superadmin", "admin"]),
  coachController.create,
);
coachRoutes.patch("/password", coachController.changePassword);

export { coachRoutes };
