import bcrypt from 'bcrypt';
import {
  getUserCredentialsByEmailAndRole,
  createUserCredentials,
  updateUserPassword,
  UserCredentials,
  CreateUserCredentialsInput
} from '@/app/lib/dal/userCredentials';

// Mock bcrypt for consistent testing
jest.mock('bcrypt');
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<any>;

describe('userCredentials DAL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBcryptHash.mockImplementation(async (password: string) => `hashed_${password}`);
  });

  describe('getUserCredentialsByEmailAndRole', () => {
    it('should return existing user credentials for valid email and role', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('admin@test.com', 'admin');

      expect(credentials).toBeTruthy();
      expect(credentials?.email).toBe('admin@test.com');
      expect(credentials?.role).toBe('admin');
      expect(credentials?.id).toBe('1');
    });

    it('should return volunteer credentials', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('volunteer@test.com', 'volunteer');

      expect(credentials).toBeTruthy();
      expect(credentials?.email).toBe('volunteer@test.com');
      expect(credentials?.role).toBe('volunteer');
      expect(credentials?.id).toBe('2');
    });

    it('should return null for non-existent email', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('nonexistent@test.com', 'admin');

      expect(credentials).toBeNull();
    });

    it('should return null for wrong role', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('admin@test.com', 'volunteer');

      expect(credentials).toBeNull();
    });

    it('should return null for empty email', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('', 'admin');

      expect(credentials).toBeNull();
    });

    it('should return null for empty role', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('admin@test.com', '');

      expect(credentials).toBeNull();
    });

    it('should be case sensitive for email', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('ADMIN@test.com', 'admin');

      expect(credentials).toBeNull();
    });

    it('should be case sensitive for role', async () => {
      const credentials = await getUserCredentialsByEmailAndRole('admin@test.com', 'ADMIN');

      expect(credentials).toBeNull();
    });
  });

  describe('createUserCredentials', () => {
    const validInput: CreateUserCredentialsInput = {
      email: 'newuser@test.com',
      password: 'secure-password-123',
      role: 'volunteer'
    };

    it('should create new user credentials successfully', async () => {
      const newCredentials = await createUserCredentials(validInput);

      expect(newCredentials).toBeTruthy();
      expect(newCredentials.email).toBe(validInput.email);
      expect(newCredentials.role).toBe(validInput.role);
      expect(newCredentials.password).toBe('hashed_secure-password-123');
      expect(newCredentials.id).toBeTruthy();
      expect(newCredentials.createdAt).toBeInstanceOf(Date);
      expect(newCredentials.updatedAt).toBeInstanceOf(Date);
      expect(mockBcryptHash).toHaveBeenCalledWith('secure-password-123', 10);
    });

    it('should throw error when user already exists', async () => {
      const existingUserInput: CreateUserCredentialsInput = {
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      };

      await expect(createUserCredentials(existingUserInput))
        .rejects.toThrow('User with this email already exists');
    });

    it('should create user with admin role', async () => {
      const adminInput: CreateUserCredentialsInput = {
        email: 'newadmin@test.com',
        password: 'admin-password',
        role: 'admin'
      };

      const newCredentials = await createUserCredentials(adminInput);

      expect(newCredentials.role).toBe('admin');
      expect(newCredentials.email).toBe('newadmin@test.com');
    });

    it('should assign incremental IDs', async () => {
      const input1: CreateUserCredentialsInput = {
        email: 'user1@test.com',
        password: 'password1',
        role: 'volunteer'
      };

      const input2: CreateUserCredentialsInput = {
        email: 'user2@test.com',
        password: 'password2',
        role: 'volunteer'
      };

      const credentials1 = await createUserCredentials(input1);
      const credentials2 = await createUserCredentials(input2);

      expect(parseInt(credentials2.id)).toBeGreaterThan(parseInt(credentials1.id));
    });

    it('should hash password with bcrypt', async () => {
      const uniqueInput = {
        ...validInput,
        email: 'unique-bcrypt-test@test.com'
      };
      
      await createUserCredentials(uniqueInput);

      expect(mockBcryptHash).toHaveBeenCalledWith('secure-password-123', 10);
      expect(mockBcryptHash).toHaveBeenCalledTimes(1);
    });

    it('should handle bcrypt errors', async () => {
      const uniqueInput = {
        ...validInput,
        email: 'bcrypt-error-test@test.com'
      };
      
      mockBcryptHash.mockRejectedValue(new Error('Bcrypt error'));

      await expect(createUserCredentials(uniqueInput))
        .rejects.toThrow('Bcrypt error');
    });

    it('should create credentials with current timestamp', async () => {
      const uniqueInput = {
        ...validInput,
        email: 'timestamp-test@test.com'
      };
      
      const beforeCreation = new Date();
      const newCredentials = await createUserCredentials(uniqueInput);
      const afterCreation = new Date();

      expect(newCredentials.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(newCredentials.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(newCredentials.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(newCredentials.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('updateUserPassword', () => {
    it('should update password for existing user', async () => {
      const newPassword = 'new-secure-password';
      const updatedCredentials = await updateUserPassword('1', newPassword);

      expect(updatedCredentials).toBeTruthy();
      expect(updatedCredentials?.password).toBe('hashed_new-secure-password');
      expect(updatedCredentials?.id).toBe('1');
      expect(updatedCredentials?.updatedAt).toBeInstanceOf(Date);
      expect(mockBcryptHash).toHaveBeenCalledWith(newPassword, 10);
    });

    it('should return null for non-existent user', async () => {
      const result = await updateUserPassword('999', 'new-password');

      expect(result).toBeNull();
      expect(mockBcryptHash).not.toHaveBeenCalled();
    });

    it('should update updatedAt timestamp', async () => {
      const beforeUpdate = new Date();
      const updatedCredentials = await updateUserPassword('2', 'updated-password');
      const afterUpdate = new Date();

      expect(updatedCredentials?.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updatedCredentials?.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it('should preserve other user fields', async () => {
      const originalCredentials = await getUserCredentialsByEmailAndRole('volunteer@test.com', 'volunteer');
      const updatedCredentials = await updateUserPassword('2', 'new-password');

      expect(updatedCredentials?.id).toBe(originalCredentials?.id);
      expect(updatedCredentials?.email).toBe(originalCredentials?.email);
      expect(updatedCredentials?.role).toBe(originalCredentials?.role);
      expect(updatedCredentials?.createdAt).toEqual(originalCredentials?.createdAt);
      // Only password and updatedAt should change
      expect(updatedCredentials?.password).not.toBe(originalCredentials?.password);
    });

    it('should handle bcrypt errors during password update', async () => {
      mockBcryptHash.mockRejectedValue(new Error('Hashing failed'));

      await expect(updateUserPassword('1', 'new-password'))
        .rejects.toThrow('Hashing failed');
    });

    it('should handle empty password', async () => {
      const updatedCredentials = await updateUserPassword('1', '');

      expect(updatedCredentials?.password).toBe('hashed_');
      expect(mockBcryptHash).toHaveBeenCalledWith('', 10);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      const updatedCredentials = await updateUserPassword('1', specialPassword);

      expect(updatedCredentials?.password).toBe(`hashed_${specialPassword}`);
      expect(mockBcryptHash).toHaveBeenCalledWith(specialPassword, 10);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent user creation attempts', async () => {
      const input1: CreateUserCredentialsInput = {
        email: 'concurrent1@test.com',
        password: 'password1',
        role: 'volunteer'
      };

      const input2: CreateUserCredentialsInput = {
        email: 'concurrent2@test.com',
        password: 'password2',
        role: 'volunteer'
      };

      const [credentials1, credentials2] = await Promise.all([
        createUserCredentials(input1),
        createUserCredentials(input2)
      ]);

      expect(credentials1.email).toBe('concurrent1@test.com');
      expect(credentials2.email).toBe('concurrent2@test.com');
      expect(credentials1.id).not.toBe(credentials2.id);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const input: CreateUserCredentialsInput = {
        email: 'longpass@test.com',
        password: longPassword,
        role: 'volunteer'
      };

      const credentials = await createUserCredentials(input);

      expect(credentials.password).toBe(`hashed_${longPassword}`);
      expect(mockBcryptHash).toHaveBeenCalledWith(longPassword, 10);
    });

    it('should handle unicode characters in email and password', async () => {
      const unicodeInput: CreateUserCredentialsInput = {
        email: 'user@tëst.com',
        password: 'pässwörd123',
        role: 'volunteer'
      };

      const credentials = await createUserCredentials(unicodeInput);

      expect(credentials.email).toBe('user@tëst.com');
      expect(credentials.password).toBe('hashed_pässwörd123');
    });
  });
});