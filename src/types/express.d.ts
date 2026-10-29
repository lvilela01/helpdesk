import { UserRole } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        role: UserRole;
        name: string;
      };
    }
  }
}

export {};
