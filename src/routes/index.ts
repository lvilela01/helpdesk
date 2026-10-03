import { Router } from "express";
import { adminsRoutes } from "./admins-routes";
import { sessionsRoutes } from "./sessions-routes";
import { coachRoutes } from "./coach-routes";

const routes = Router();
routes.use("/users", adminsRoutes);
routes.use("/sessions", sessionsRoutes);
routes.use("/coach", coachRoutes);

export { routes };
