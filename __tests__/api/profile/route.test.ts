import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/profile/route';
import * as userProfileDAL from '@/app/lib/dal/userProfile';

// Mock the auth module
jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

import { auth } from '@/auth';
const mockAuth = auth as jest.MockedFunction<any>;

// Mock the DAL module
jest.mock('@/app/lib/dal/userProfile');
const mockGetUserProfileStatus = userProfileDAL.getUserProfileStatus as jest.MockedFunction<any>;
const mockGetUserProfileByUserId = userProfileDAL.getUserProfileByUserId as jest.MockedFunction<any>;
const mockCreateUserProfile = userProfileDAL.createUserProfile as jest.MockedFunction<any>;
const mockUpdateUserProfile = userProfileDAL.updateUserProfile as jest.MockedFunction<any>;

// Helper to create mock request
function createMockRequest(url: string, options: { method?: string; body?: any } = {}) {
  return new NextRequest(url, {
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

describe('/api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      
      const request = createMockRequest('http://localhost:3000/api/profile');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Not authenticated');
    });

    it('should return profile status when status=true', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-123' } } as any);
      mockGetUserProfileStatus.mockResolvedValue({ isComplete: true });
      
      const request = createMockRequest('http://localhost:3000/api/profile?status=true');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.isComplete).toBe(true);
      expect(mockGetUserProfileStatus).toHaveBeenCalledWith('user-123');
    });

    it('should return full profile data when status is not requested', async () => {
      const mockProfile = {
        id: '1',
        userId: 'user-123',
        fullName: 'John Doe',
        address1: '123 Main St',
        address2: '',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        skills: ['Event Planning'],
        preferences: 'Weekend events',
        availability: ['2024-12-15'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAuth.mockResolvedValue({ user: { id: 'user-123' } } as any);
      mockGetUserProfileByUserId.mockResolvedValue(mockProfile);
      
      const request = createMockRequest('http://localhost:3000/api/profile');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.fullName).toBe('John Doe');
      expect(mockGetUserProfileByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should handle errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth error'));
      
      const request = createMockRequest('http://localhost:3000/api/profile');
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Internal server error');
    });
  });

  describe('POST /api/profile', () => {
    const validProfileData = {
      fullName: 'John Doe',
      address1: '123 Main St',
      address2: 'Apt 4B',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      skills: ['Event Planning', 'Food Service'],
      preferences: 'Weekend events preferred',
      availability: ['2024-12-15', '2024-12-22']
    };

    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      
      const request = createMockRequest('http://localhost:3000/api/profile', {
        method: 'POST',
        body: validProfileData
      });
      const response = await POST(request);
      
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Not authenticated');
    });

    describe('Validation Tests', () => {
      beforeEach(() => {
        mockAuth.mockResolvedValue({ user: { id: 'user-123' } } as any);
      });

      it('should require full name', async () => {
        const invalidData = { ...validProfileData, fullName: '' };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Full name is required');
      });

      it('should enforce full name character limit', async () => {
        const invalidData = { ...validProfileData, fullName: 'a'.repeat(51) };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Full name must be 50 characters or less');
      });

      it('should require address1', async () => {
        const invalidData = { ...validProfileData, address1: '   ' };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Address is required');
      });

      it('should enforce address1 character limit', async () => {
        const invalidData = { ...validProfileData, address1: 'a'.repeat(101) };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Address 1 must be 100 characters or less');
      });

      it('should enforce address2 character limit', async () => {
        const invalidData = { ...validProfileData, address2: 'a'.repeat(101) };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Address 2 must be 100 characters or less');
      });

      it('should require city', async () => {
        const invalidData = { ...validProfileData, city: '' };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('City is required');
      });

      it('should enforce city character limit', async () => {
        const invalidData = { ...validProfileData, city: 'a'.repeat(101) };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('City must be 100 characters or less');
      });

      it('should require state', async () => {
        const invalidData = { ...validProfileData, state: '' };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('State is required');
      });

      it('should require 2-character state code', async () => {
        const invalidData = { ...validProfileData, state: 'TEX' };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('State must be a valid 2-character code');
      });

      it('should require minimum zip code length', async () => {
        const invalidData = { ...validProfileData, zipCode: '1234' };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Zip code must be at least 5 characters');
      });

      it('should enforce maximum zip code length', async () => {
        const invalidData = { ...validProfileData, zipCode: '1234567890' };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Zip code must be 9 characters or less');
      });

      it('should require at least one skill', async () => {
        const invalidData = { ...validProfileData, skills: [] };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('At least one skill is required');
      });

      it('should require at least one availability date', async () => {
        const invalidData = { ...validProfileData, availability: [] };
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: invalidData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('At least one availability date is required');
      });
    });

    describe('Profile Creation/Update', () => {
      beforeEach(() => {
        mockAuth.mockResolvedValue({ user: { id: 'user-123' } } as any);
      });

      it('should create new profile when none exists', async () => {
        mockGetUserProfileByUserId.mockResolvedValue(null);
        mockCreateUserProfile.mockResolvedValue({
          id: '1',
          userId: 'user-123',
          ...validProfileData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: validProfileData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.message).toBe('Profile saved successfully');
        expect(mockCreateUserProfile).toHaveBeenCalledWith({
          userId: 'user-123',
          ...validProfileData
        });
      });

      it('should update existing profile', async () => {
        const existingProfile = {
          id: '1',
          userId: 'user-123',
          fullName: 'Old Name',
          address1: '456 Old St',
          address2: '',
          city: 'Old City',
          state: 'TX',
          zipCode: '77002',
          skills: ['Old Skill'],
          preferences: 'Old preferences',
          availability: ['2024-01-01'],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockGetUserProfileByUserId.mockResolvedValue(existingProfile);
        mockUpdateUserProfile.mockResolvedValue({
          ...existingProfile,
          ...validProfileData,
          updatedAt: new Date()
        });
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: validProfileData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(mockUpdateUserProfile).toHaveBeenCalledWith('user-123', validProfileData);
      });

      it('should handle database errors', async () => {
        mockGetUserProfileByUserId.mockRejectedValue(new Error('Database error'));
        
        const request = createMockRequest('http://localhost:3000/api/profile', {
          method: 'POST',
          body: validProfileData
        });
        const response = await POST(request);
        
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.error).toBe('Database error');
      });
    });
  });
});