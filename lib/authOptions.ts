// lib/authOptions.ts

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(">>> [authorize] credentials:", credentials);

        if (!credentials?.email || !credentials.password) {
          console.log(">>> [authorize] Missing email or password");
          return null;
        }

        try {
          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            console.log(">>> [authorize] User not found or no passwordHash");
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            console.log(">>> [authorize] Invalid password");
            return null;
          }

          console.log(">>> [authorize] User authorized:", {
            id: user.id,
            email: user.email,
            companyId: user.companyId,
          });

          // Return the shape NextAuth expects
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            companyId: user.companyId,
          };
        } catch (error) {
          console.error(">>> [authorize] Error:", error);
          return null;
        }
      },
    }),
    // ... Additional providers if needed
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log(">>> [jwt] incoming token:", token);
      console.log(">>> [jwt] incoming user:", user);

      if (user) {
        token.id = user.id;
        token.companyId = user.companyId; // <-- keep this a string
      }

      console.log(">>> [jwt] outgoing token:", token);
      return token;
    },
    async session({ session, token }) {
      console.log(">>> [session] incoming token:", token);
      console.log(">>> [session] incoming session:", session);

      if (token) {
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string; 
      }

      console.log(">>> [session] outgoing session:", session);
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
