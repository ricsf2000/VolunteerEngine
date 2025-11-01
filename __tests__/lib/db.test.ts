import { prisma } from '@/app/lib/db';

describe('Database connection', () => {
  it('should export prisma client', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma).toBe('object');
  });

  it('should handle development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Test development environment branch
    process.env.NODE_ENV = 'development';
    
    // Re-import to trigger the branch
    jest.resetModules();
    const { prisma: devPrisma } = require('@/app/lib/db');
    
    expect(devPrisma).toBeDefined();
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Test production environment (line 9 should not execute)
    process.env.NODE_ENV = 'production';
    
    // Re-import to test production path
    jest.resetModules();
    const { prisma: prodPrisma } = require('@/app/lib/db');
    
    expect(prodPrisma).toBeDefined();
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });
});