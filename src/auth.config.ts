import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.role) {
        (session.user as any).role = token.role;
      }
      if (token?.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnVolunteer = nextUrl.pathname.startsWith('/volunteer');
      const isOnRoot = nextUrl.pathname === '/';
      
      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (userRole !== 'admin') return false;
        return true;
      }
      
      if (isOnVolunteer) {
        if (!isLoggedIn) return false;
        if (userRole !== 'volunteer') return false;
        return true;
      }
      
      if ((isOnLogin || isOnRoot) && isLoggedIn) {
        if (userRole === 'admin') {
          return Response.redirect(new URL('/admin', nextUrl));
        } else if (userRole === 'volunteer') {
          return Response.redirect(new URL('/volunteer', nextUrl));
        }
      }
      
      if (isOnLogin || isOnRoot) return true;
      
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;