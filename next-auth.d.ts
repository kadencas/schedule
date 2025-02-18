// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      companyId: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    companyId: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyId: number;
  }
}
