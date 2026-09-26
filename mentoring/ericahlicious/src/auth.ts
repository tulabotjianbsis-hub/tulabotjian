import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Look up user in the real MySQL database
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;
        if (user.status === "ARCHIVED") return null;

        // Compare bcrypt hashed password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!passwordMatch) return null;

        // Update lastActive timestamp
        await db.user.update({
          where: { id: user.id },
          data: { lastActive: new Date() },
        });

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
});
