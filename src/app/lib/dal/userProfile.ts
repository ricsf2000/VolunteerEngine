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

// Hardcoded profiles - replace with Prisma queries later
const userProfiles: UserProfile[] = [
  {
    id: '1',
    userId: '2', // volunteer@test.com
    fullName: 'John Volunteer',
    address1: '123 Main St',
    address2: 'Apt 4B',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    skills: ['Event Planning', 'Food Service', 'Community Outreach'],
    preferences: 'Prefer weekend events and community-focused activities',
    availability: ['2024-12-15', '2024-12-22', '2025-01-05'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  
];

export async function getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
  const profile = userProfiles.find(p => p.userId === userId);
  return profile || null;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  return [...userProfiles];
}

export async function createUserProfile(input: CreateUserProfileInput): Promise<UserProfile> {
  // Check if profile already exists
  const existingProfile = await getUserProfileByUserId(input.userId);
  if (existingProfile) {
    throw new Error('Profile already exists for this user');
  }

  const newProfile: UserProfile = {
    id: (userProfiles.length + 1).toString(),
    userId: input.userId,
    fullName: input.fullName,
    address1: input.address1,
    address2: input.address2,
    city: input.city,
    state: input.state,
    zipCode: input.zipCode,
    skills: input.skills,
    preferences: input.preferences,
    availability: input.availability,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  userProfiles.push(newProfile);
  
  return newProfile;
}

export async function updateUserProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile | null> {
  const profileIndex = userProfiles.findIndex(p => p.userId === userId);
  if (profileIndex === -1) return null;
  
  const profile = userProfiles[profileIndex];
  
  // Update only provided fields
  userProfiles[profileIndex] = {
    ...profile,
    ...input,
    updatedAt: new Date(),
  };
  
  return userProfiles[profileIndex];
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

