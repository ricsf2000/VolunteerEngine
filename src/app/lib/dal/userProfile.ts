import { prisma } from '@/app/lib/db';
import type { UserProfile as PrismaUserProfile } from '@/generated/prisma';

export interface UserProfile {
  id: string;
  userId: string; // Foreign key to UserCredentials
  fullName: string;
  address1: string; // Primary address (required)
  address2: string; // Secondary address (optional - apartment, suite, etc.)
  city: string;
  state: string;
  zipCode: string; // Changed to match form field name
  skills: string[]; // Array of skill names
  preferences: string; // Text field for volunteer preferences
  availability: string[]; // Array of available dates
  createdAt: Date;
  updatedAt: Date;
}

// Remove the auto-generated fields for creation
export type CreateUserProfileInput = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;

// For updates, make all fields optional except userId
export type UpdateUserProfileInput = Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

/**
 * Helper function to convert Prisma UserProfile to our interface
 */
function toUserProfile(profile: PrismaUserProfile): UserProfile {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    address1: profile.address1,
    address2: profile.address2 || '',
    city: profile.city,
    state: profile.state,
    zipCode: profile.zipCode,
    skills: profile.skills,
    preferences: profile.preferences || '',
    availability: profile.availability,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) return null;
    return toUserProfile(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  try {
    const profiles = await prisma.userProfile.findMany();
    return profiles.map(toUserProfile);
  } catch (error) {
    console.error('Error fetching all user profiles:', error);
    return [];
  }
}

export async function createUserProfile(input: CreateUserProfileInput): Promise<UserProfile> {
  try {
    // Check if profile already exists
    const existingProfile = await getUserProfileByUserId(input.userId);
    if (existingProfile) {
      throw new Error('Profile already exists for this user');
    }

    const profile = await prisma.userProfile.create({
      data: {
        userId: input.userId,
        fullName: input.fullName,
        address1: input.address1,
        address2: input.address2 || '',
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        skills: input.skills,
        preferences: input.preferences || '',
        availability: input.availability,
      }
    });

    return toUserProfile(profile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile | null> {
  try {
    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        ...(input.fullName !== undefined && { fullName: input.fullName }),
        ...(input.address1 !== undefined && { address1: input.address1 }),
        ...(input.address2 !== undefined && { address2: input.address2 }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.zipCode !== undefined && { zipCode: input.zipCode }),
        ...(input.skills !== undefined && { skills: input.skills }),
        ...(input.preferences !== undefined && { preferences: input.preferences }),
        ...(input.availability !== undefined && { availability: input.availability }),
      }
    });

    return toUserProfile(profile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) {
    console.log('isProfileComplete: Profile is null');
    return false;
  }
  
  const checks = {
    fullName: !!profile.fullName?.trim(),
    address1: !!profile.address1?.trim(), 
    city: !!profile.city?.trim(),
    state: !!profile.state,
    zipCode: (profile.zipCode?.length || 0) >= 5,
    skills: (profile.skills?.length || 0) > 0,
    availability: (profile.availability?.length || 0) > 0
  };
  
  console.log('isProfileComplete checks:', checks);
  console.log('zipCode length:', profile.zipCode?.length);
  
  const isComplete = checks.fullName && checks.address1 && checks.city && 
                    checks.state && checks.zipCode && checks.skills && checks.availability;
  
  console.log('isProfileComplete result:', isComplete);
  return isComplete;
}

export async function getUserProfileStatus(userId: string): Promise<{ isComplete: boolean; profile?: UserProfile }> {
  const profile = await getUserProfileByUserId(userId);
  const isComplete = isProfileComplete(profile);
  
  if (profile) {
    return { isComplete, profile };
  } else {
    return { isComplete };
  }
}

