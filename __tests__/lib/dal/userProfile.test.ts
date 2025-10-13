
import {
  getUserProfileByUserId,
  createUserProfile,
  updateUserProfile,
  isProfileComplete,
  getUserProfileStatus,
  UserProfile,
  CreateUserProfileInput,
  UpdateUserProfileInput
} from '@/app/lib/dal/userProfile';

describe('userProfile DAL', () => {

  describe('getUserProfileByUserId', () => {
    it('should return existing profile for valid user ID', async () => {
      const profile = await getUserProfileByUserId('2');

      expect(profile).toBeTruthy();
      expect(profile?.userId).toBe('2');
      expect(profile?.fullName).toBe('John Volunteer');
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

  describe('createUserProfile', () => {
    const validInput: CreateUserProfileInput = {
      userId: 'new-user-123',
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
      const profile = await createUserProfile(validInput);

      expect(profile).toBeTruthy();
      expect(profile.userId).toBe(validInput.userId);
      expect(profile.fullName).toBe(validInput.fullName);
      expect(profile.address1).toBe(validInput.address1);
      expect(profile.address2).toBe(validInput.address2);
      expect(profile.city).toBe(validInput.city);
      expect(profile.state).toBe(validInput.state);
      expect(profile.zipCode).toBe(validInput.zipCode);
      expect(profile.skills).toEqual(validInput.skills);
      expect(profile.preferences).toBe(validInput.preferences);
      expect(profile.availability).toEqual(validInput.availability);
      expect(profile.id).toBeTruthy();
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when profile already exists', async () => {
      const existingUserInput: CreateUserProfileInput = {
        userId: '2', // This user already has a profile
        fullName: 'Test User',
        address1: '123 Test St',
        address2: '',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        skills: ['Test Skill'],
        preferences: 'Test preferences',
        availability: ['2024-12-15']
      };

      await expect(createUserProfile(existingUserInput)).rejects.toThrow('Profile already exists for this user');
    });

    it('should assign incremental ID', async () => {
      const input1 = { ...validInput, userId: 'user-1' };
      const input2 = { ...validInput, userId: 'user-2' };

      const profile1 = await createUserProfile(input1);
      const profile2 = await createUserProfile(input2);

      expect(parseInt(profile2.id)).toBeGreaterThan(parseInt(profile1.id));
    });
  });

  describe('updateUserProfile', () => {
    const updateInput: UpdateUserProfileInput = {
      fullName: 'John Updated',
      city: 'Austin',
      skills: ['Updated Skill'],
      preferences: 'Updated preferences'
    };

    it('should update existing profile successfully', async () => {
      const updatedProfile = await updateUserProfile('2', updateInput);

      expect(updatedProfile).toBeTruthy();
      expect(updatedProfile?.fullName).toBe(updateInput.fullName);
      expect(updatedProfile?.city).toBe(updateInput.city);
      expect(updatedProfile?.skills).toEqual(updateInput.skills);
      expect(updatedProfile?.preferences).toBe(updateInput.preferences);
      // Should preserve unchanged fields
      expect(updatedProfile?.userId).toBe('2');
      expect(updatedProfile?.address1).toBe('123 Main St');
      expect(updatedProfile?.state).toBe('TX');
    });

    it('should return null for non-existent user', async () => {
      const result = await updateUserProfile('999', updateInput);

      expect(result).toBeNull();
    });

    it('should update updatedAt timestamp', async () => {
      const originalDate = new Date('2024-01-01');
      const updatedProfile = await updateUserProfile('2', updateInput);

      expect(updatedProfile?.updatedAt).toBeInstanceOf(Date);
      expect(updatedProfile?.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime());
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { fullName: 'Partially Updated' };
      
      const updatedProfile = await updateUserProfile('2', partialUpdate);

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
      const status = await getUserProfileStatus('2');

      expect(status.isComplete).toBe(true);
      expect(status.profile).toBeTruthy();
      expect(status.profile?.userId).toBe('2');
    });

    it('should return incomplete status for non-existent profile', async () => {
      const status = await getUserProfileStatus('999');

      expect(status.isComplete).toBe(false);
      expect(status.profile).toBeUndefined();
    });

    it('should return incomplete status for incomplete profile', async () => {
      // First create an incomplete profile
      const incompleteInput: CreateUserProfileInput = {
        userId: 'incomplete-user',
        fullName: '', // Missing required field
        address1: '123 Test St',
        address2: '',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        skills: ['Test Skill'],
        preferences: '',
        availability: ['2024-12-15']
      };

      await createUserProfile(incompleteInput);

      // Now check status
      const status = await getUserProfileStatus('incomplete-user');

      expect(status.isComplete).toBe(false);
      expect(status.profile).toBeTruthy();
    });
  });
});