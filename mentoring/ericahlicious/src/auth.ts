import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

// ---------------------------------------------------------------------------
// Mock users — replace this with real DB lookup when Aiven MySQL is ready
// ---------------------------------------------------------------------------
const MOCK_USERS = [
  { id: "1", name: "Supervisor",  email: "supervisor@test.com", password: "password", role: "SUPERVISOR" },
  { id: "2", name: "Manager",     email: "manager@test.com",    password: "password", role: "ADMIN" },
  { id: "3", name: "Owner",       email: "owner@test.com",      password: "password", role: "OWNER" },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = MOCK_USERS.find(
          (u) => u.email === (credentials.email as string)
        );

        if (!user) return null;
        if (user.password !== (credentials.password as string)) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
});
