// Certain code has been commented out, pending backend implementation
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { z } from 'zod';
// import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
// import postgres from 'postgres';
 
// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Dummy users for development - remove when backend is implemented
const dummyUsers = [
  { id: '1', email: 'admin@test.com', name: 'Admin User', password: 'dummy-password', role: 'admin' },
  { id: '2', email: 'volunteer@test.com', name: 'Volunteer User', password: 'dummy-password', role: 'volunteer' },
];
 
async function getUser(email: string, expectedRole?: string): Promise<any | undefined> {
  // try {
  //   const user = await sql<User[]>`SELECT * FROM users WHERE email=${email} AND role=${expectedRole}`;
  //   return user[0];
  // } catch (error) {
  //   console.error('Failed to fetch user:', error);
  //   throw new Error('Failed to fetch user.');
  // }
  
  // Dummy implementation - remove when backend is implemented
  const user = dummyUsers.find(user => user.email === email);
  
  if (expectedRole && user && user.role !== expectedRole) {
    return undefined;
  }
  
  return user;
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // Extract expected role from callback URL
          let expectedRole: string | undefined;
          const callbackUrl = (credentials as any).callbackUrl;
          if (callbackUrl) {
            const decodedUrl = decodeURIComponent(callbackUrl);
            if (decodedUrl.includes('/admin')) {
              expectedRole = 'admin';
            } else if (decodedUrl.includes('/volunteer')) {
              expectedRole = 'volunteer';
            }
          }
          
          const user = await getUser(email, expectedRole);
          if (!user) return null;
          // const passwordsMatch = await bcrypt.compare(password, user.password); // Uncomment when backend is implemented
          const passwordsMatch = true; // Dummy - any password works for now

          if (passwordsMatch) return user;
        }
 
        console.log('Credentials not valid')
        return null;
      },
    }),
  ],
});