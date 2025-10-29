
import bcrypt from 'bcrypt';
import { prisma } from '@/app/lib/db';

import {
  getUserProfileByUserId,
  getAllUserProfiles,
  createUserProfile,
  updateUserProfile,
  isProfileComplete,
  getUserProfileStatus,
  UserProfile,
  CreateUserProfileInput,
  UpdateUserProfileInput
} from '@/app/lib/dal/userProfile';

const TEST_PASSWORD = 'Password123!';

async function createTestCredentials(emailPrefix = 'user'): Promise<{ id: string; email: string }> {
  const unique = `${emailPrefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const credentials = await prisma.userCredentials.create({
    data: {
      email: `${unique}@test.com`,
      password: await bcrypt.hash(TEST_PASSWORD, 10),
      role: 'volunteer',
    },
  });

  return { id: credentials.id, email: credentials.email };
}

type ProfileFixture = {
  userId: string;
  cleanup: () => Promise<void>;
  defaults: CreateUserProfileInput;
};

async function createProfileFixture(overrides: Partial<CreateUserProfileInput> = {}): Promise<ProfileFixture> {
  const credentials = await createTestCredentials('profile');

  const defaults: CreateUserProfileInput = {
    userId: credentials.id,
    fullName: 'Fixture Volunteer',
    address1: '123 Main St',
    address2: 'Apt 4B',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    skills: ['Event Planning', 'Food Service'],
    preferences: 'Prefers weekend events and community-focused activities',
    availability: ['2025-01-05'],
  };

  const data = { ...defaults, ...overrides };

  const profile = await prisma.userProfile.create({
    data: {
      ...data,
      address2: data.address2 ? data.address2 : null,
    },
  });

  const cleanup = async () => {
    await prisma.userProfile.delete({ where: { id: profile.id } }).catch(() => {});
    await prisma.userCredentials.delete({ where: { id: credentials.id } }).catch(() => {});
  };

  return { userId: credentials.id, cleanup, defaults: data };
}

describe('userProfile DAL', () => {

  describe('getUserProfileByUserId', () => {
    let fixture: ProfileFixture;

    beforeAll(async () => {
      fixture = await createProfileFixture();
    });

    afterAll(async () => {
      await fixture.cleanup();
    });

    it('should return existing profile for valid user ID', async () => {
      const profile = await getUserProfileByUserId(fixture.userId);

      expect(profile).toBeTruthy();
      expect(profile?.userId).toBe(fixture.userId);
      expect(profile?.fullName).toBe(fixture.defaults.fullName);
    });

    it('should return null for non-existent user ID', async () => {
      const profile = await getUserProfileByUserId('999');

      expect(profile).toBeNull();
    });

    it('should return null for empty user ID', async () => {
      const profile = await getUserProfileByUserId('');

      expect(profile).toBeNull();
    });
  });

  describe('getAllUserProfiles', () => {
    let fixtures: ProfileFixture[] = [];

    beforeAll(async () => {
      fixtures = [
        await createProfileFixture({
          fullName: 'First Fixture',
          address2: '',
          availability: ['2025-01-06'],
        }),
        await createProfileFixture({
          fullName: 'Second Fixture',
          preferences: 'Different preferences',
          availability: ['2025-01-07'],
        }),
      ];
    });

    afterAll(async () => {
      await Promise.all(fixtures.map(f => f.cleanup()));
    });

    it('should return all profiles with normalized optional fields', async () => {
      const profiles = await getAllUserProfiles();
      const fetched = fixtures.map(f => profiles.find(p => p.userId === f.userId));

      fetched.forEach(profile => expect(profile).toBeTruthy());
      // address2 should normalize null to empty string
      expect(fetched[0]?.address2).toBe('');
      expect(Array.isArray(fetched[0]?.skills)).toBe(true);
      expect(Array.isArray(fetched[0]?.availability)).toBe(true);
    });

    it('should order profiles by most recent creation first', async () => {
      const profiles = await getAllUserProfiles();
      const idxFirst = profiles.findIndex(p => p.userId === fixtures[0].userId);
      const idxSecond = profiles.findIndex(p => p.userId === fixtures[1].userId);

      expect(idxFirst).toBeGreaterThanOrEqual(0);
      expect(idxSecond).toBeGreaterThanOrEqual(0);
      expect(idxSecond).toBeLessThan(idxFirst);
    });
  });

  describe('normalization and error handling', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should coerce non-array JSON fields to empty arrays', async () => {
      const credentials = await createTestCredentials('normalize');
      let profileId: string | undefined;

      try {
        await prisma.userProfile.create({
          data: {
            userId: credentials.id,
            fullName: 'JSON Edge Case',
            address1: '100 Edge St',
            address2: null,
            city: 'Edge City',
            state: 'TX',
            zipCode: '77002',
            skills: 'not-an-array',
            preferences: 'none',
            availability: '2025-01-01',
          },
        });

        const profile = await getUserProfileByUserId(credentials.id);
        profileId = profile?.id;

        expect(profile?.skills).toEqual([]);
        expect(profile?.availability).toEqual([]);
      } finally {
        if (profileId) {
          await prisma.userProfile.delete({ where: { id: profileId } }).catch(() => {});
        }
        await prisma.userCredentials.delete({ where: { id: credentials.id } }).catch(() => {});
      }
    });

    it('should return null when getUserProfileByUserId encounters an error', async () => {
      jest.spyOn(prisma.userProfile, 'findUnique').mockRejectedValue(new Error('database down'));

      const result = await getUserProfileByUserId('any-user');

      expect(result).toBeNull();
    });

    it('should return empty array when getAllUserProfiles fails', async () => {
      jest.spyOn(prisma.userProfile, 'findMany').mockRejectedValue(new Error('database down'));

      const result = await getAllUserProfiles();

      expect(result).toEqual([]);
    });

    it('should throw friendly error when createUserProfile fails to persist', async () => {
      const credentials = await createTestCredentials('create-error');
      const spy = jest.spyOn(prisma.userProfile, 'create').mockRejectedValue(new Error('insert failed'));

      await expect(createUserProfile({
        userId: credentials.id,
        fullName: 'Failure Case',
        address1: '1 Failure Way',
        address2: '',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        skills: ['Testing'],
        preferences: 'none',
        availability: ['2025-01-01'],
      })).rejects.toThrow('Failed to create user profile');

      spy.mockRestore();
      await prisma.userCredentials.delete({ where: { id: credentials.id } }).catch(() => {});
    });

    it('should reuse existing profile when updateUserProfile receives no changes', async () => {
      const fixture = await createProfileFixture();

      try {
        const original = await getUserProfileByUserId(fixture.userId);
        const result = await updateUserProfile(fixture.userId, {});

        expect(result?.id).toBe(original?.id);
        expect(result?.fullName).toBe(original?.fullName);
      } finally {
        await fixture.cleanup();
      }
    });

    it('should surface update failures with friendly message', async () => {
      const fixture = await createProfileFixture();
      const spy = jest.spyOn(prisma.userProfile, 'update').mockRejectedValue(new Error('update failed'));

      await expect(updateUserProfile(fixture.userId, { fullName: 'Will Fail' }))
        .rejects.toThrow('Failed to update user profile');

      spy.mockRestore();
      await fixture.cleanup();
    });
  });

  describe('createUserProfile', () => {
    const baseProfileInput: Omit<CreateUserProfileInput, 'userId'> = {
      fullName: 'Jane Doe',
      address1: '456 Oak St',
      address2: 'Suite 200',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75001',
      skills: ['Teaching/Training', 'Youth Mentoring'],
      preferences: 'Prefer morning hours',
      availability: ['2024-12-20', '2024-12-27']
    };

    it('should create a new profile successfully', async () => {
      const credentials = await createTestCredentials('create-profile');
      const input: CreateUserProfileInput = { ...baseProfileInput, userId: credentials.id };

      let profile;
      try {
        profile = await createUserProfile(input);

        expect(profile).toBeTruthy();
        expect(profile.userId).toBe(input.userId);
        expect(profile.fullName).toBe(input.fullName);
        expect(profile.address1).toBe(input.address1);
        expect(profile.address2).toBe(input.address2);
        expect(profile.city).toBe(input.city);
        expect(profile.state).toBe(input.state);
        expect(profile.zipCode).toBe(input.zipCode);
        expect(profile.skills).toEqual(input.skills);
        expect(profile.preferences).toBe(input.preferences);
        expect(profile.availability).toEqual(input.availability);
        expect(profile.id).toBeTruthy();
        expect(profile.createdAt).toBeInstanceOf(Date);
        expect(profile.updatedAt).toBeInstanceOf(Date);
      } finally {
        await prisma.userProfile.delete({ where: { id: profile?.id ?? '' } }).catch(() => {});
        await prisma.userCredentials.delete({ where: { id: credentials.id } }).catch(() => {});
      }
    });

    it('should throw error when profile already exists', async () => {
      const fixture = await createProfileFixture({
        address2: '',
        preferences: 'Existing preferences',
      });

      const existingUserInput: CreateUserProfileInput = {
        ...fixture.defaults,
        userId: fixture.userId,
      };

      await expect(createUserProfile(existingUserInput)).rejects.toThrow('Profile already exists for this user');

      await fixture.cleanup();
    });

    it('should generate unique IDs for new profiles', async () => {
      const credentials1 = await createTestCredentials('unique-profile-1');
      const credentials2 = await createTestCredentials('unique-profile-2');

      let profile1;
      let profile2;

      try {
        profile1 = await createUserProfile({ ...baseProfileInput, userId: credentials1.id });
        profile2 = await createUserProfile({ ...baseProfileInput, userId: credentials2.id });

        expect(profile1.id).toBeTruthy();
        expect(profile2.id).toBeTruthy();
        expect(profile1.id).not.toBe(profile2.id);
        expect(profile1.id).toHaveLength(36);
        expect(profile2.id).toHaveLength(36);
      } finally {
        if (profile1) {
          await prisma.userProfile.delete({ where: { id: profile1.id } }).catch(() => {});
        }
        if (profile2) {
          await prisma.userProfile.delete({ where: { id: profile2.id } }).catch(() => {});
        }
        await prisma.userCredentials.deleteMany({
          where: { id: { in: [credentials1.id, credentials2.id] } },
        }).catch(() => {});
      }
    });
  });

  describe('updateUserProfile', () => {
    let fixture: ProfileFixture;

    beforeEach(async () => {
      fixture = await createProfileFixture({
        fullName: 'Original Name',
        city: 'Houston',
        skills: ['Original Skill'],
        preferences: 'Original preferences',
      });
    });

    afterEach(async () => {
      await fixture.cleanup();
    });

    const updateInput: UpdateUserProfileInput = {
      fullName: 'John Updated',
      city: 'Austin',
      skills: ['Updated Skill'],
      preferences: 'Updated preferences'
    };

    it('should update existing profile successfully', async () => {
      const updatedProfile = await updateUserProfile(fixture.userId, updateInput);

      expect(updatedProfile).toBeTruthy();
      expect(updatedProfile?.fullName).toBe(updateInput.fullName);
      expect(updatedProfile?.city).toBe(updateInput.city);
      expect(updatedProfile?.skills).toEqual(updateInput.skills);
      expect(updatedProfile?.preferences).toBe(updateInput.preferences);
      // Should preserve unchanged fields
      expect(updatedProfile?.userId).toBe(fixture.userId);
      expect(updatedProfile?.address1).toBe(fixture.defaults.address1);
      expect(updatedProfile?.state).toBe('TX');
    });

    it('should return null for non-existent user', async () => {
      const result = await updateUserProfile('999', updateInput);

      expect(result).toBeNull();
    });

    it('should update updatedAt timestamp', async () => {
      const beforeUpdate = await prisma.userProfile.findUnique({ where: { userId: fixture.userId } });
      const updatedProfile = await updateUserProfile(fixture.userId, updateInput);

      expect(updatedProfile?.updatedAt).toBeInstanceOf(Date);
      expect(updatedProfile?.updatedAt.getTime()).toBeGreaterThan(beforeUpdate!.updatedAt.getTime());
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { fullName: 'Partially Updated' };
      
      const updatedProfile = await updateUserProfile(fixture.userId, partialUpdate);

      expect(updatedProfile?.fullName).toBe('Partially Updated');
      // Other fields should exist (previous tests may have modified them)
      expect(updatedProfile?.city).toBeTruthy();
      expect(updatedProfile?.skills).toBeTruthy();
      expect(Array.isArray(updatedProfile?.skills)).toBe(true);
    });
  });

  describe('isProfileComplete', () => {
    const completeProfile: UserProfile = {
      id: '1',
      userId: 'test-user',
      fullName: 'Test User',
      address1: '123 Test St',
      address2: 'Apt 1',
      city: 'Test City',
      state: 'TX',
      zipCode: '12345',
      skills: ['Test Skill'],
      preferences: 'Test preferences',
      availability: ['2024-12-15'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should return true for complete profile', () => {
      const result = isProfileComplete(completeProfile);
      expect(result).toBe(true);
    });

    it('should return false for null profile', () => {
      const result = isProfileComplete(null);
      expect(result).toBe(false);
    });

    it('should return false when fullName is missing', () => {
      const incompleteProfile = { ...completeProfile, fullName: '' };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should return false when fullName is only whitespace', () => {
      const incompleteProfile = { ...completeProfile, fullName: '   ' };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should return false when address1 is missing', () => {
      const incompleteProfile = { ...completeProfile, address1: '' };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should return false when city is missing', () => {
      const incompleteProfile = { ...completeProfile, city: '  ' };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should return false when state is missing', () => {
      const incompleteProfile = { ...completeProfile, state: '' };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should return false when zipCode is too short', () => {
      const incompleteProfile = { ...completeProfile, zipCode: '1234' };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should return true when zipCode is exactly 5 characters', () => {
      const profile = { ...completeProfile, zipCode: '12345' };
      const result = isProfileComplete(profile);
      expect(result).toBe(true);
    });

    it('should return true when zipCode is 9 characters', () => {
      const profile = { ...completeProfile, zipCode: '123456789' };
      const result = isProfileComplete(profile);
      expect(result).toBe(true);
    });

    it('should return false when skills array is empty', () => {
      const incompleteProfile = { ...completeProfile, skills: [] };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should return false when availability array is empty', () => {
      const incompleteProfile = { ...completeProfile, availability: [] };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should handle undefined skills', () => {
      const incompleteProfile = { ...completeProfile, skills: undefined as any };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should handle undefined availability', () => {
      const incompleteProfile = { ...completeProfile, availability: undefined as any };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });

    it('should handle undefined zipCode', () => {
      const incompleteProfile = { ...completeProfile, zipCode: undefined as any };
      const result = isProfileComplete(incompleteProfile);
      expect(result).toBe(false);
    });
  });

  describe('getUserProfileStatus', () => {
    it('should return complete status for existing complete profile', async () => {
      const fixture = await createProfileFixture();

      const status = await getUserProfileStatus(fixture.userId);

      expect(status.isComplete).toBe(true);
      expect(status.profile).toBeTruthy();
      expect(status.profile?.userId).toBe(fixture.userId);

      await fixture.cleanup();
    });

    it('should return incomplete status for non-existent profile', async () => {
      const status = await getUserProfileStatus('999');

      expect(status.isComplete).toBe(false);
      expect(status.profile).toBeUndefined();
    });

    it('should return incomplete status for incomplete profile', async () => {
      const credentials = await createTestCredentials('incomplete-profile');

      const incompleteProfile = await prisma.userProfile.create({
        data: {
          userId: credentials.id,
          fullName: '', // Missing required field
          address1: '123 Test St',
          address2: null,
          city: 'Test City',
          state: 'TX',
          zipCode: '12345',
          skills: ['Test Skill'],
          preferences: '',
          availability: ['2024-12-15'],
        },
      });

      // Now check status
      const status = await getUserProfileStatus(credentials.id);

      expect(status.isComplete).toBe(false);
      expect(status.profile).toBeTruthy();

      await prisma.userProfile.delete({ where: { id: incompleteProfile.id } }).catch(() => {});
      await prisma.userCredentials.delete({ where: { id: credentials.id } }).catch(() => {});
    });
  });
});
