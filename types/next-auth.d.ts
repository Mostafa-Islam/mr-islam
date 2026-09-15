import type { DefaultSession } from "next-auth";
import type { Role, Status } from "@/lib/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: Status;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: Status;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role: Role;
    status: Status;
  }
}