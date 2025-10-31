import { prisma } from '@/app/lib/db';
import { Prisma, type UserProfile as PrismaUserProfile } from '@/generated/prisma';

export type UserProfile = {
  id: string;
  userId: string;
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  skills: string[];
  preferences: string;
  availability: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserProfileInput = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserProfileInput = Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item));
  }
  return [];
}

function normalizeProfile(profile: PrismaUserProfile): UserProfile {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    address1: profile.address1,
    address2: profile.address2 ?? '',
    city: profile.city,
    state: profile.state,
    zipCode: profile.zipCode,
    skills: toStringArray(profile.skills),
    preferences: profile.preferences,
    availability: toStringArray(profile.availability),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function mapAddress2(address2?: string): string | null | undefined {
  if (address2 === undefined) return undefined;
  const trimmed = address2.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    return profile ? normalizeProfile(profile) : null;
  } catch (error) {
    console.error('Error fetching user profile by userId:', error);
    return null;
  }
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  try {
    const profiles = await prisma.userProfile.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map(normalizeProfile);
  } catch (error) {
    console.error('Error fetching all user profiles:', error);
    return [];
  }
}

export async function createUserProfile(input: CreateUserProfileInput): Promise<UserProfile> {
  const existing = await prisma.userProfile.findUnique({
    where: { userId: input.userId },
  });

  if (existing) {
    throw new Error('Profile already exists for this user');
  }

  try {
    const created = await prisma.userProfile.create({
      data: {
        userId: input.userId,
        fullName: input.fullName,
        address1: input.address1,
        address2: mapAddress2(input.address2) ?? null,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        skills: input.skills,
        preferences: input.preferences,
        availability: input.availability,
      },
    });

    return normalizeProfile(created);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

export async function updateUserProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile | null> {
  if (!userId) return null;

  const data: Prisma.UserProfileUpdateInput = {};

  if (input.fullName !== undefined) data.fullName = input.fullName;
  if (input.address1 !== undefined) data.address1 = input.address1;
  if (input.address2 !== undefined) data.address2 = mapAddress2(input.address2) ?? null;
  if (input.city !== undefined) data.city = input.city;
  if (input.state !== undefined) data.state = input.state;
  if (input.zipCode !== undefined) data.zipCode = input.zipCode;
  if (input.skills !== undefined) data.skills = input.skills;
  if (input.preferences !== undefined) data.preferences = input.preferences;
  if (input.availability !== undefined) data.availability = input.availability;

  if (Object.keys(data).length === 0) {
    return getUserProfileByUserId(userId);
  }

  try {
    const updated = await prisma.userProfile.update({
      where: { userId },
      data,
    });
    return normalizeProfile(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
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
    availability: (profile.availability?.length || 0) > 0,
  };

  console.log('isProfileComplete checks:', checks);
  console.log('zipCode length:', profile.zipCode?.length);

  const isComplete =
    checks.fullName &&
    checks.address1 &&
    checks.city &&
    checks.state &&
    checks.zipCode &&
    checks.skills &&
    checks.availability;

  console.log('isProfileComplete result:', isComplete);
  return isComplete;
}

export async function getUserProfileStatus(userId: string): Promise<{ isComplete: boolean; profile?: UserProfile }> {
  const profile = await getUserProfileByUserId(userId);
  const isComplete = isProfileComplete(profile);

  if (profile) {
    return { isComplete, profile };
  }
  return { isComplete };
}
