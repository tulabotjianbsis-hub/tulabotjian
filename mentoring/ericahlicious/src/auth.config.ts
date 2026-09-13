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
      const isCustomerRoute = nextUrl.pathname.startsWith("/cart") || 
                             nextUrl.pathname.startsWith("/checkout") || 
                             nextUrl.pathname.startsWith("/order");

      if (isAdminRoute) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  providers: [],
};
