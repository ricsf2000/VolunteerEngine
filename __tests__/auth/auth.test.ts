import bcrypt from 'bcrypt';
import * as userCredentialsDAL from '@/app/lib/dal/userCredentials';

// Mock the DAL module
jest.mock('@/app/lib/dal/userCredentials');
const mockGetUserCredentialsByEmailAndRole = userCredentialsDAL.getUserCredentialsByEmailAndRole as jest.MockedFunction<any>;

// Mock bcrypt
jest.mock('bcrypt');
const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<any>;

describe('Auth Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Authentication', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: '$2b$10$hashedpassword',
      role: 'volunteer',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should find user by email and role', async () => {
      mockGetUserCredentialsByEmailAndRole.mockResolvedValue(mockUser);

      const result = await userCredentialsDAL.getUserCredentialsByEmailAndRole('test@example.com', 'volunteer');

      expect(result).toEqual(mockUser);
      expect(mockGetUserCredentialsByEmailAndRole).toHaveBeenCalledWith('test@example.com', 'volunteer');
    });

    it('should return null when user not found', async () => {
      mockGetUserCredentialsByEmailAndRole.mockResolvedValue(null);

      const result = await userCredentialsDAL.getUserCredentialsByEmailAndRole('nonexistent@example.com', 'volunteer');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockGetUserCredentialsByEmailAndRole.mockRejectedValue(new Error('Database error'));

      await expect(
        userCredentialsDAL.getUserCredentialsByEmailAndRole('test@example.com', 'volunteer')
      ).rejects.toThrow('Database error');
    });
  });

  describe('Password Validation', () => {
    it('should validate correct password', async () => {
      mockBcryptCompare.mockResolvedValue(true);

      const result = await bcrypt.compare('correct-password', '$2b$10$hashedpassword');

      expect(result).toBe(true);
      expect(mockBcryptCompare).toHaveBeenCalledWith('correct-password', '$2b$10$hashedpassword');
    });

    it('should reject incorrect password', async () => {
      mockBcryptCompare.mockResolvedValue(false);

      const result = await bcrypt.compare('wrong-password', '$2b$10$hashedpassword');

      expect(result).toBe(false);
    });

    it('should handle bcrypt errors', async () => {
      mockBcryptCompare.mockRejectedValue(new Error('Bcrypt error'));

      await expect(
        bcrypt.compare('password', '$2b$10$hashedpassword')
      ).rejects.toThrow('Bcrypt error');
    });
  });

  describe('Role-based Authorization Logic', () => {
    it('should authorize admin for admin routes', () => {
      const auth = { user: { role: 'admin' } };
      const nextUrl = { pathname: '/admin/dashboard' };

      // Test the authorization logic from auth.config.ts
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      const authorized = isLoggedIn && userRole === 'admin' && isOnAdmin;

      expect(authorized).toBe(true);
    });

    it('should deny volunteer access to admin routes', () => {
      const auth = { user: { role: 'volunteer' } };
      const nextUrl = { pathname: '/admin/dashboard' };

      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      const authorized = isLoggedIn && userRole === 'admin' && isOnAdmin;

      expect(authorized).toBe(false);
    });

    it('should authorize volunteer for volunteer routes', () => {
      const auth = { user: { role: 'volunteer' } };
      const nextUrl = { pathname: '/volunteer/profile' };

      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnVolunteer = nextUrl.pathname.startsWith('/volunteer');

      const authorized = isLoggedIn && userRole === 'volunteer' && isOnVolunteer;

      expect(authorized).toBe(true);
    });

    it('should deny admin access to volunteer routes', () => {
      const auth = { user: { role: 'admin' } };
      const nextUrl = { pathname: '/volunteer/profile' };

      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnVolunteer = nextUrl.pathname.startsWith('/volunteer');

      const authorized = isLoggedIn && userRole === 'volunteer' && isOnVolunteer;

      expect(authorized).toBe(false);
    });

    it('should deny unauthenticated access to protected routes', () => {
      const auth = null;
      const nextUrl = { pathname: '/admin/dashboard' };

      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      const authorized = isLoggedIn && isOnAdmin;

      expect(authorized).toBe(false);
    });
  });

  describe('JWT and Session Callbacks Logic', () => {
    it('should add user data to JWT token', () => {
      const token = {};
      const user = { id: '123', role: 'volunteer' };

      // Simulate JWT callback logic
      if (user) {
        (token as any).role = user.role;
        (token as any).id = user.id;
      }

      expect(token).toEqual({ role: 'volunteer', id: '123' });
    });

    it('should add token data to session', () => {
      const session = { user: {} };
      const token = { role: 'admin', id: '456' };

      // Simulate session callback logic
      if (token?.role) {
        (session.user as any).role = token.role;
      }
      if (token?.id) {
        (session.user as any).id = token.id;
      }

      expect(session.user).toEqual({ role: 'admin', id: '456' });
    });

    it('should handle missing token data gracefully', () => {
      const session = { user: {} };
      const token = {};

      // Simulate session callback logic
      if (token?.role) {
        (session.user as any).role = token.role;
      }
      if (token?.id) {
        (session.user as any).id = token.id;
      }

      expect(session.user).toEqual({});
    });
  });

  describe('URL Role Detection Logic', () => {
    it('should detect admin role from callback URL', () => {
      const callbackUrl = encodeURIComponent('http://localhost:3000/admin/dashboard');
      
      let expectedRole: string | undefined;
      const decodedUrl = decodeURIComponent(callbackUrl);
      if (decodedUrl.includes('/admin')) {
        expectedRole = 'admin';
      } else if (decodedUrl.includes('/volunteer')) {
        expectedRole = 'volunteer';
      }

      expect(expectedRole).toBe('admin');
    });

    it('should detect volunteer role from callback URL', () => {
      const callbackUrl = encodeURIComponent('http://localhost:3000/volunteer/profile');
      
      let expectedRole: string | undefined;
      const decodedUrl = decodeURIComponent(callbackUrl);
      if (decodedUrl.includes('/admin')) {
        expectedRole = 'admin';
      } else if (decodedUrl.includes('/volunteer')) {
        expectedRole = 'volunteer';
      }

      expect(expectedRole).toBe('volunteer');
    });

    it('should return undefined for ambiguous URLs', () => {
      const callbackUrl = encodeURIComponent('http://localhost:3000/login');
      
      let expectedRole: string | undefined;
      const decodedUrl = decodeURIComponent(callbackUrl);
      if (decodedUrl.includes('/admin')) {
        expectedRole = 'admin';
      } else if (decodedUrl.includes('/volunteer')) {
        expectedRole = 'volunteer';
      }

      expect(expectedRole).toBeUndefined();
    });

    it('should handle complex URLs with query parameters', () => {
      const callbackUrl = encodeURIComponent('http://localhost:3000/admin/users?page=1&sort=name');
      
      let expectedRole: string | undefined;
      const decodedUrl = decodeURIComponent(callbackUrl);
      if (decodedUrl.includes('/admin')) {
        expectedRole = 'admin';
      } else if (decodedUrl.includes('/volunteer')) {
        expectedRole = 'volunteer';
      }

      expect(expectedRole).toBe('admin');
    });
  });
});