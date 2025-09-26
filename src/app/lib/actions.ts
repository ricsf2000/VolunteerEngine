'use server';
 
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credentials not valid.';
        default:
          return 'Error.';
      }
    }
    throw error;
  }
}

export async function handleSignOut() {
  await signOut({ redirectTo: '/' });
}

export async function registerUser(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const role = formData.get('role') as string;

    // Basic validation
    if (!email || !password || !confirmPassword || !role) {
      return 'All fields are required.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    // TODO: Check if user already exists
    // TODO: Hash password with bcrypt
    // TODO: Insert user into database
    
    // For now, just log the registration attempt
    console.log('Registration attempt:', { email, role });
    
    // TODO: Actually create user in database here
    
    // Auto-login the user after successful registration
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      redirectTo: role === 'admin' ? '/admin' : '/volunteer/profile'
    });
    
  } catch (error) {
    // Re-throw redirect errors (they're expected from signIn)
    if (error && typeof error === 'object' && 'digest' in error && 
        (error as any).digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('Registration error:', error);
    return 'Registration failed. Please try again.';
  }
}