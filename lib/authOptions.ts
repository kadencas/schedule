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

        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            return null;
          }



          // Return the shape NextAuth expects
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            companyId: user.companyId,
            role: user.role,
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

      if (user) {
        token.id = user.id;
        token.companyId = user.companyId; // <-- keep this a string
        token.role = user.role;
      }


      return token;
    },
    async session({ session, token }) {


      if (token) {
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string; 
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
