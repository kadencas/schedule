// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Ensure both email and password were provided
        if (!credentials?.email || !credentials.password) return null;

        // Look up the user in your database (note: use the model name from your Prisma schema)
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        // If no user found or no passwordHash, return null
        if (!user || !user.passwordHash) return null;

        // Compare the provided password with the stored hash
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // If valid, return a minimal user object.
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    // You can add additional OAuth providers here if needed.
  ],
  session: {
    strategy: "jwt", // We’re using JWT for session management
  },
  callbacks: {
    async jwt({ token, user }) {
      // When a user object is available (on first sign-in), attach the user id to the token.
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      // Expose the user id on the session object for client components.
      if (token) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/signin", // Custom sign-in page route
  },
};
