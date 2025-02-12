import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: do a DB lookup or whatever logic you need
        if (
          credentials?.email === "demo@example.com" &&
          credentials.password === "demo"
        ) {
          return { id: "123", name: "Demo User", email: "demo@example.com" };
        }
        // Return null if login fails
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
};
