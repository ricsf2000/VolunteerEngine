import bcrypt from 'bcrypt';
import { prisma } from '@/app/lib/db';
import type { UserCredentials } from '@/generated/prisma';

export interface CreateUserCredentialsInput {
  email: string;
  password: string; // plain text, will be encrypted
  role: 'admin' | 'volunteer';
}

export async function getUserCredentialsByEmailAndRole(email: string, role: string): Promise<UserCredentials | null> {
  try {
    const credentials = await prisma.userCredentials.findFirst({
      where: {
        email,
        role,
      },
    });
    return credentials;
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    return null;
  }
}

export async function createUserCredentials(input: CreateUserCredentialsInput): Promise<UserCredentials> {
  // Check if user already exists  
  const existingCredentials = await getUserCredentialsByEmailAndRole(input.email, input.role);
  if (existingCredentials) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);
  
  try {
    const newCredentials = await prisma.userCredentials.create({
      data: {
        email: input.email,
        password: hashedPassword,
        role: input.role,
      },
    });
    
    return newCredentials;
  } catch (error) {
    console.error('Error creating user credentials:', error);
    throw new Error('Failed to create user credentials');
  }
}


export async function updateUserPassword(userId: string, newPassword: string): Promise<UserCredentials | null> {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedCredentials = await prisma.userCredentials.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
    
    return updatedCredentials;
  } catch (error) {
    console.error('Error updating user password:', error);
    return null;
  }
}