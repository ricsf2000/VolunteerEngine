import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { z } from 'zod';
import { getUserCredentialsByEmailAndRole } from '@/app/lib/dal/userCredentials';
import bcrypt from 'bcrypt';
 
async function getUser(email: string, role: string) {
  try {
    return await getUserCredentialsByEmailAndRole(email, role);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
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

          console.log('Auth debug - email:', email, 'expectedRole:', expectedRole);
          
          if (!expectedRole) {
            console.log('No expected role found, auth failed');
            return null;
          }
          
          const user = await getUser(email, expectedRole);
          console.log('Found user:', user ? 'YES' : 'NO');
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log('Password match:', passwordsMatch);
          if (passwordsMatch) return user;
        }
 
        console.log('Credentials not valid')
        return null;
      },
    }),
  ],
});