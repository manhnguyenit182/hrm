import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { Employees, Positions } from "@/db/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      role?: string | null;
      employee?: Employees | null;
      permissions: string[];
      position?: Positions | null;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
    employee?: Employees | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
    employee?: Employees | null;
    permissions?: string[];
    position?: Positions | null;
  }
}
