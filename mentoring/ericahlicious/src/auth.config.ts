import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string })?.role;
      
      const path = nextUrl.pathname;
      
      const isProtected = path.startsWith("/dashboard") || 
                          path.startsWith("/menu") ||
                          path.startsWith("/ingredients") ||
                          path.startsWith("/orders") ||
                          path.startsWith("/users") ||
                          path.startsWith("/reports");

      if (isProtected) {
        if (!isLoggedIn) return false;
        
        // Role-based access control
        if (path.startsWith("/users") || path.startsWith("/reports")) {
          if (role !== "OWNER" && role !== "ADMIN") return false;
        }
        
        if (path.startsWith("/ingredients")) {
          if (role !== "OWNER" && role !== "SUPERVISOR") return false;
        }
        
        if (path.startsWith("/orders")) {
          if (role !== "OWNER" && role !== "SUPERVISOR") return false;
        }
        
        return true;
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
