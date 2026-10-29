import { Router } from "express";
import { adminsRoutes } from "./admin-routes";
import { sessionsRoutes } from "./sessions-routes";
import { coachRoutes } from "./coach-routes";
import { uploadsRoutes } from "./uploads-routes";
import { clientsRoutes } from "./client-routes";
import { changePasswordRoutes } from "./changePassword-routes";

const routes = Router();
routes.use("/users", adminsRoutes);
routes.use("/sessions", sessionsRoutes);
routes.use("/coach", coachRoutes);
routes.use("/uploads", uploadsRoutes);
routes.use("/clients", clientsRoutes);
routes.use("/account/password", changePasswordRoutes);

export { routes };
