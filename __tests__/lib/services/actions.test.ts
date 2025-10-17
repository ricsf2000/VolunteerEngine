import * as authModule from '@/auth';
import * as userCredentialsDAL from '@/app/lib/dal/userCredentials';
import { authenticate, handleSignOut, registerUser } from '@/app/lib/services/actions';

// Mock NextAuth
jest.mock('@/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn()
}));

// Mock userCredentials DAL
jest.mock('@/app/lib/dal/userCredentials', () => ({
  createUserCredentials: jest.fn()
}));

// Mock NextAuth AuthError
jest.mock('next-auth', () => ({
  AuthError: class MockAuthError extends Error {
    type: string;
    constructor(type: string) {
      super(`AuthError: ${type}`);
      this.type = type;
      this.name = 'AuthError';
    }
  }
}));

// Import AuthError after mocking
import { AuthError } from 'next-auth';

const mockSignIn = authModule.signIn as jest.MockedFunction<any>;
const mockSignOut = authModule.signOut as jest.MockedFunction<any>;
const mockCreateUserCredentials = userCredentialsDAL.createUserCredentials as jest.MockedFunction<any>;

describe('Services Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    const createMockFormData = (email: string, password: string) => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      return formData;
    };

    it('should authenticate successfully with valid credentials', async () => {
      mockSignIn.mockResolvedValue(undefined);
      const formData = createMockFormData('test@example.com', 'password123');

      const result = await authenticate(undefined, formData);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', formData);
      expect(result).toBeUndefined();
    });

    it('should return credentials error for invalid credentials', async () => {
      const credentialsError = new AuthError('CredentialsSignin');
      credentialsError.type = 'CredentialsSignin';
      mockSignIn.mockRejectedValue(credentialsError);
      
      const formData = createMockFormData('invalid@example.com', 'wrongpassword');

      const result = await authenticate(undefined, formData);

      expect(result).toBe('Credentials not valid.');
    });

    it('should return generic error for other auth errors', async () => {
      const authError = new AuthError('OtherError');
      authError.type = 'OtherError' as any;
      mockSignIn.mockRejectedValue(authError);
      
      const formData = createMockFormData('test@example.com', 'password123');

      const result = await authenticate(undefined, formData);

      expect(result).toBe('Error.');
    });

    it('should re-throw non-auth errors', async () => {
      const genericError = new Error('Network error');
      mockSignIn.mockRejectedValue(genericError);
      
      const formData = createMockFormData('test@example.com', 'password123');

      await expect(authenticate(undefined, formData)).rejects.toThrow('Network error');
    });

    it('should handle previous state parameter', async () => {
      mockSignIn.mockResolvedValue(undefined);
      const formData = createMockFormData('test@example.com', 'password123');

      const result = await authenticate('previous error', formData);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', formData);
      expect(result).toBeUndefined();
    });
  });

  describe('handleSignOut', () => {
    it('should sign out successfully', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await handleSignOut();

      expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: '/' });
    });

    it('should handle sign out errors', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      await expect(handleSignOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('registerUser', () => {
    const createRegistrationFormData = (data: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      role?: string;
    }) => {
      const formData = new FormData();
      if (data.email) formData.append('email', data.email);
      if (data.password) formData.append('password', data.password);
      if (data.confirmPassword) formData.append('confirmPassword', data.confirmPassword);
      if (data.role) formData.append('role', data.role);
      return formData;
    };

    describe('Validation', () => {
      it('should require all fields', async () => {
        const formData = createRegistrationFormData({
          email: 'test@example.com',
          password: 'password123'
          // Missing confirmPassword and role
        });

        const result = await registerUser(undefined, formData);

        expect(result).toBe('All fields are required.');
        expect(mockCreateUserCredentials).not.toHaveBeenCalled();
      });

      it('should require email field', async () => {
        const formData = createRegistrationFormData({
          password: 'password123',
          confirmPassword: 'password123',
          role: 'volunteer'
          // Missing email
        });

        const result = await registerUser(undefined, formData);

        expect(result).toBe('All fields are required.');
      });

      it('should require password confirmation match', async () => {
        const formData = createRegistrationFormData({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword',
          role: 'volunteer'
        });

        const result = await registerUser(undefined, formData);

        expect(result).toBe('Passwords do not match.');
        expect(mockCreateUserCredentials).not.toHaveBeenCalled();
      });

      it('should enforce minimum password length', async () => {
        const formData = createRegistrationFormData({
          email: 'test@example.com',
          password: '12345', // Only 5 characters
          confirmPassword: '12345',
          role: 'volunteer'
        });

        const result = await registerUser(undefined, formData);

        expect(result).toBe('Password must be at least 6 characters.');
        expect(mockCreateUserCredentials).not.toHaveBeenCalled();
      });
    });

    describe('Successful Registration', () => {
      const validRegistrationData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
        role: 'volunteer'
      };

      it('should register volunteer successfully and redirect to profile', async () => {
        mockCreateUserCredentials.mockResolvedValue({
          id: '123',
          email: 'newuser@example.com',
          role: 'volunteer',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Mock redirect error which is expected behavior
        const redirectError = new Error('NEXT_REDIRECT');
        (redirectError as any).digest = 'NEXT_REDIRECT_DIGEST';
        mockSignIn.mockRejectedValue(redirectError);
        
        const formData = createRegistrationFormData(validRegistrationData);

        await expect(registerUser(undefined, formData)).rejects.toThrow('NEXT_REDIRECT');

        expect(mockCreateUserCredentials).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'securepassword123',
          role: 'volunteer'
        });
        
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'newuser@example.com',
          password: 'securepassword123',
          redirect: true,
          redirectTo: '/volunteer/profile'
        });
      });

      it('should register admin successfully and redirect to admin dashboard', async () => {
        mockCreateUserCredentials.mockResolvedValue({
          id: '456',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const redirectError = new Error('NEXT_REDIRECT');
        (redirectError as any).digest = 'NEXT_REDIRECT_DIGEST';
        mockSignIn.mockRejectedValue(redirectError);
        
        const formData = createRegistrationFormData({
          ...validRegistrationData,
          email: 'admin@example.com',
          role: 'admin'
        });

        await expect(registerUser(undefined, formData)).rejects.toThrow('NEXT_REDIRECT');

        expect(mockCreateUserCredentials).toHaveBeenCalledWith({
          email: 'admin@example.com',
          password: 'securepassword123',
          role: 'admin'
        });
        
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'admin@example.com',
          password: 'securepassword123',
          redirect: true,
          redirectTo: '/admin'
        });
      });
    });

    describe('Error Handling', () => {
      const validRegistrationData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'volunteer'
      };

      it('should handle user creation errors', async () => {
        mockCreateUserCredentials.mockRejectedValue(new Error('User already exists'));
        
        const formData = createRegistrationFormData(validRegistrationData);

        const result = await registerUser(undefined, formData);

        expect(result).toBe('Registration failed. Please try again.');
        expect(mockSignIn).not.toHaveBeenCalled();
      });

      it('should handle sign in errors after successful registration', async () => {
        mockCreateUserCredentials.mockResolvedValue({
          id: '123',
          email: 'test@example.com',
          role: 'volunteer',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        mockSignIn.mockRejectedValue(new Error('Sign in failed'));
        
        const formData = createRegistrationFormData(validRegistrationData);

        const result = await registerUser(undefined, formData);

        expect(result).toBe('Registration failed. Please try again.');
        expect(mockCreateUserCredentials).toHaveBeenCalled();
      });

      it('should handle empty form data gracefully', async () => {
        const formData = new FormData();

        const result = await registerUser(undefined, formData);

        expect(result).toBe('All fields are required.');
      });

      it('should handle null form values', async () => {
        const formData = new FormData();
        formData.append('email', '');
        formData.append('password', '');
        formData.append('confirmPassword', '');
        formData.append('role', '');

        const result = await registerUser(undefined, formData);

        expect(result).toBe('All fields are required.');
      });
    });

    describe('Edge Cases', () => {
      it('should handle very long passwords', async () => {
        const longPassword = 'a'.repeat(1000);
        const formData = createRegistrationFormData({
          email: 'test@example.com',
          password: longPassword,
          confirmPassword: longPassword,
          role: 'volunteer'
        });

        mockCreateUserCredentials.mockResolvedValue({
          id: '123',
          email: 'test@example.com',
          role: 'volunteer',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const redirectError = new Error('NEXT_REDIRECT');
        (redirectError as any).digest = 'NEXT_REDIRECT_DIGEST';
        mockSignIn.mockRejectedValue(redirectError);

        await expect(registerUser(undefined, formData)).rejects.toThrow('NEXT_REDIRECT');

        expect(mockCreateUserCredentials).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: longPassword,
          role: 'volunteer'
        });
      });

      it('should handle unicode characters in email and password', async () => {
        const formData = createRegistrationFormData({
          email: 'tëst@example.com',
          password: 'pässwörd123',
          confirmPassword: 'pässwörd123',
          role: 'volunteer'
        });

        mockCreateUserCredentials.mockResolvedValue({
          id: '123',
          email: 'tëst@example.com',
          role: 'volunteer',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const redirectError = new Error('NEXT_REDIRECT');
        (redirectError as any).digest = 'NEXT_REDIRECT_DIGEST';
        mockSignIn.mockRejectedValue(redirectError);

        await expect(registerUser(undefined, formData)).rejects.toThrow('NEXT_REDIRECT');

        expect(mockCreateUserCredentials).toHaveBeenCalledWith({
          email: 'tëst@example.com',
          password: 'pässwörd123',
          role: 'volunteer'
        });
      });
    });
  });
});