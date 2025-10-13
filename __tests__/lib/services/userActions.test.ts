import * as authModule from '@/auth';
import * as userProfileDAL from '@/app/lib/dal/userProfile';
import { getProfileStatus, saveProfile, getProfile } from '@/app/lib/services/userActions';

// Mock NextAuth
jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

// Mock userProfile DAL
jest.mock('@/app/lib/dal/userProfile', () => ({
  getUserProfileStatus: jest.fn(),
  getUserProfileByUserId: jest.fn(),
  createUserProfile: jest.fn(),
  updateUserProfile: jest.fn()
}));

const mockAuth = authModule.auth as jest.MockedFunction<any>;
const mockGetUserProfileStatus = userProfileDAL.getUserProfileStatus as jest.MockedFunction<any>;
const mockGetUserProfileByUserId = userProfileDAL.getUserProfileByUserId as jest.MockedFunction<any>;
const mockCreateUserProfile = userProfileDAL.createUserProfile as jest.MockedFunction<any>;
const mockUpdateUserProfile = userProfileDAL.updateUserProfile as jest.MockedFunction<any>;

describe('User Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileStatus', () => {
    it('should return profile status for authenticated user', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
      mockGetUserProfileStatus.mockResolvedValue({ isComplete: true, profile: { id: '1' } });

      const result = await getProfileStatus();

      expect(result).toEqual({ isComplete: true, profile: { id: '1' } });
      expect(mockGetUserProfileStatus).toHaveBeenCalledWith('user-123');
    });

    it('should return incomplete status for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getProfileStatus();

      expect(result).toEqual({ isComplete: false });
      expect(mockGetUserProfileStatus).not.toHaveBeenCalled();
    });

    it('should return incomplete status when session has no user', async () => {
      mockAuth.mockResolvedValue({ user: null });

      const result = await getProfileStatus();

      expect(result).toEqual({ isComplete: false });
      expect(mockGetUserProfileStatus).not.toHaveBeenCalled();
    });

    it('should handle auth errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth error'));

      const result = await getProfileStatus();

      expect(result).toEqual({ isComplete: false });
      expect(mockGetUserProfileStatus).not.toHaveBeenCalled();
    });

    it('should handle DAL errors gracefully', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
      mockGetUserProfileStatus.mockRejectedValue(new Error('Database error'));

      const result = await getProfileStatus();

      expect(result).toEqual({ isComplete: false });
    });
  });

  describe('getProfile', () => {
    const mockProfile = {
      id: '1',
      userId: 'user-123',
      fullName: 'John Doe',
      address1: '123 Main St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      skills: ['Event Planning'],
      availability: ['2024-12-15']
    };

    it('should return profile for authenticated user', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
      mockGetUserProfileByUserId.mockResolvedValue(mockProfile);

      const result = await getProfile();

      expect(result).toEqual(mockProfile);
      expect(mockGetUserProfileByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return null for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getProfile();

      expect(result).toBeNull();
      expect(mockGetUserProfileByUserId).not.toHaveBeenCalled();
    });

    it('should return null when session has no user', async () => {
      mockAuth.mockResolvedValue({ user: null });

      const result = await getProfile();

      expect(result).toBeNull();
      expect(mockGetUserProfileByUserId).not.toHaveBeenCalled();
    });

    it('should handle auth errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth error'));

      const result = await getProfile();

      expect(result).toBeNull();
      expect(mockGetUserProfileByUserId).not.toHaveBeenCalled();
    });

    it('should handle DAL errors gracefully', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
      mockGetUserProfileByUserId.mockRejectedValue(new Error('Database error'));

      const result = await getProfile();

      expect(result).toBeNull();
    });

    it('should return null when profile does not exist', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
      mockGetUserProfileByUserId.mockResolvedValue(null);

      const result = await getProfile();

      expect(result).toBeNull();
    });
  });

  describe('saveProfile', () => {
    const validProfileData = {
      fullName: 'Jane Doe',
      address1: '456 Oak St',
      address2: 'Apt 2B',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75001',
      skills: ['Teaching/Training', 'Youth Mentoring'],
      preferences: 'Weekend events',
      availability: ['2024-12-20', '2024-12-27']
    };

    beforeEach(() => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
    });

    describe('Authentication', () => {
      it('should return error for unauthenticated user', async () => {
        mockAuth.mockResolvedValue(null);

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
        expect(mockGetUserProfileByUserId).not.toHaveBeenCalled();
      });

      it('should return error when session has no user', async () => {
        mockAuth.mockResolvedValue({ user: null });

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Not authenticated' });
      });
    });

    describe('Validation', () => {
      it('should require full name', async () => {
        const invalidData = { ...validProfileData, fullName: '' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'Full name is required' });
        expect(mockGetUserProfileByUserId).not.toHaveBeenCalled();
      });

      it('should require full name to not be only whitespace', async () => {
        const invalidData = { ...validProfileData, fullName: '   ' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'Full name is required' });
      });

      it('should require address1', async () => {
        const invalidData = { ...validProfileData, address1: '' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'Address is required' });
      });

      it('should require address1 to not be only whitespace', async () => {
        const invalidData = { ...validProfileData, address1: '   ' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'Address is required' });
      });

      it('should require city', async () => {
        const invalidData = { ...validProfileData, city: '' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'City is required' });
      });

      it('should require city to not be only whitespace', async () => {
        const invalidData = { ...validProfileData, city: '   ' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'City is required' });
      });

      it('should require state', async () => {
        const invalidData = { ...validProfileData, state: '' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'State is required' });
      });

      it('should require state to not be falsy', async () => {
        const invalidData = { ...validProfileData, state: null };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'State is required' });
      });

      it('should require zip code with minimum length', async () => {
        const invalidData = { ...validProfileData, zipCode: '1234' };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'Valid zip code is required' });
      });

      it('should require at least one skill', async () => {
        const invalidData = { ...validProfileData, skills: [] };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'At least one skill is required' });
      });

      it('should require at least one availability date', async () => {
        const invalidData = { ...validProfileData, availability: [] };

        const result = await saveProfile(invalidData);

        expect(result).toEqual({ success: false, error: 'At least one availability date is required' });
      });
    });

    describe('Profile Creation', () => {
      it('should create new profile when none exists', async () => {
        mockGetUserProfileByUserId.mockResolvedValue(null);
        mockCreateUserProfile.mockResolvedValue({
          id: '1',
          userId: 'user-123',
          ...validProfileData
        });

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: true, message: 'Profile saved successfully' });
        expect(mockGetUserProfileByUserId).toHaveBeenCalledWith('user-123');
        expect(mockCreateUserProfile).toHaveBeenCalledWith({
          userId: 'user-123',
          ...validProfileData
        });
        expect(mockUpdateUserProfile).not.toHaveBeenCalled();
      });

      it('should handle profile creation errors', async () => {
        mockGetUserProfileByUserId.mockResolvedValue(null);
        mockCreateUserProfile.mockRejectedValue(new Error('Creation failed'));

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Creation failed' });
      });
    });

    describe('Profile Update', () => {
      const existingProfile = {
        id: '1',
        userId: 'user-123',
        fullName: 'Old Name',
        address1: '123 Old St',
        city: 'Old City',
        state: 'TX',
        zipCode: '77001',
        skills: ['Old Skill'],
        availability: ['2024-01-01']
      };

      it('should update existing profile', async () => {
        mockGetUserProfileByUserId.mockResolvedValue(existingProfile);
        mockUpdateUserProfile.mockResolvedValue({
          ...existingProfile,
          ...validProfileData
        });

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: true, message: 'Profile saved successfully' });
        expect(mockGetUserProfileByUserId).toHaveBeenCalledWith('user-123');
        expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-123', validProfileData);
        expect(mockCreateUserProfile).not.toHaveBeenCalled();
      });

      it('should handle profile update errors', async () => {
        mockGetUserProfileByUserId.mockResolvedValue(existingProfile);
        mockUpdateUserProfile.mockRejectedValue(new Error('Update failed'));

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Update failed' });
      });
    });

    describe('Error Handling', () => {
      it('should handle auth errors', async () => {
        mockAuth.mockRejectedValue(new Error('Auth error'));

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Auth error' });
      });

      it('should handle getUserProfileByUserId errors', async () => {
        mockGetUserProfileByUserId.mockRejectedValue(new Error('Database error'));

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Database error' });
      });

      it('should handle errors without message property', async () => {
        mockGetUserProfileByUserId.mockRejectedValue('String error');

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Failed to save profile' });
      });

      it('should handle null error', async () => {
        mockGetUserProfileByUserId.mockRejectedValue(null);

        const result = await saveProfile(validProfileData);

        expect(result).toEqual({ success: false, error: 'Failed to save profile' });
      });
    });

    describe('Edge Cases', () => {
      it('should handle missing nested properties gracefully', async () => {
        const incompleteData = {
          fullName: 'Test User',
          // Missing other required fields
        };

        const result = await saveProfile(incompleteData);

        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      });

      it('should accept exactly 5 character zip code', async () => {
        const dataWith5DigitZip = { ...validProfileData, zipCode: '12345' };
        mockGetUserProfileByUserId.mockResolvedValue(null);
        mockCreateUserProfile.mockResolvedValue({ id: '1', userId: 'user-123', ...dataWith5DigitZip });

        const result = await saveProfile(dataWith5DigitZip);

        expect(result).toEqual({ success: true, message: 'Profile saved successfully' });
      });

      it('should handle very long valid data', async () => {
        const longValidData = {
          ...validProfileData,
          preferences: 'Very long preferences text that goes on and on with lots of details about volunteer preferences and scheduling constraints'.repeat(10)
        };
        
        mockGetUserProfileByUserId.mockResolvedValue(null);
        mockCreateUserProfile.mockResolvedValue({ id: '1', userId: 'user-123', ...longValidData });

        const result = await saveProfile(longValidData);

        expect(result).toEqual({ success: true, message: 'Profile saved successfully' });
      });
    });
  });
});