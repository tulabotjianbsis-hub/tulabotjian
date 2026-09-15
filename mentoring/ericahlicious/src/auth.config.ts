import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/dashboard") || 
                           nextUrl.pathname.startsWith("/menu") ||
                           nextUrl.pathname.startsWith("/ingredients") ||
                           nextUrl.pathname.startsWith("/orders") ||
                           nextUrl.pathname.startsWith("/kitchen") ||
                           nextUrl.pathname.startsWith("/alerts") ||
                           nextUrl.pathname.startsWith("/analytics") ||
                           nextUrl.pathname.startsWith("/recommendations");

      if (isAdminRoute) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: unknown }).role = token.role;
      }
      return session;
    },
  },
  providers: [],
};
