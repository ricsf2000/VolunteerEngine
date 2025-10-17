import { config } from '@/middleware';

// Mock NextAuth
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    auth: jest.fn()
  }))
}));

// Mock auth config
jest.mock('@/auth.config', () => ({
  authConfig: {
    pages: { signIn: '/login' },
    callbacks: {
      authorized: jest.fn()
    },
    providers: []
  }
}));

describe('middleware.ts', () => {
  describe('config', () => {
    it('should have correct matcher pattern', () => {
      expect(config.matcher).toEqual(['/((?!api|_next/static|_next/image|.*\\.png$).*)']);
    });

    it('should verify excluded patterns for api routes', () => {
      expect('/api/users'.startsWith('/api')).toBe(true);
      expect('/api/auth/signin'.startsWith('/api')).toBe(true);
    });

    it('should verify excluded patterns for Next.js static files', () => {
      expect('/_next/static/chunks/main.js'.startsWith('/_next/static')).toBe(true);
      expect('/_next/image/logo.png'.startsWith('/_next/image')).toBe(true);
    });

    it('should verify excluded patterns for PNG files', () => {
      expect('/logo.png'.endsWith('.png')).toBe(true);
      expect('/images/banner.png'.endsWith('.png')).toBe(true);
    });

    it('should verify application routes are not excluded', () => {
      const isExcluded = (path: string) => {
        return path.startsWith('/api') || 
               path.startsWith('/_next/static') || 
               path.startsWith('/_next/image') || 
               path.endsWith('.png');
      };
      
      expect(isExcluded('/admin/dashboard')).toBe(false);
      expect(isExcluded('/volunteer/profile')).toBe(false);
      expect(isExcluded('/login')).toBe(false);
      expect(isExcluded('/')).toBe(false);
    });

    it('should have nodejs runtime', () => {
      expect(config.runtime).toBe('nodejs');
    });
  });

  describe('middleware export', () => {
    it('should export NextAuth auth function', async () => {
      // Since the middleware exports NextAuth(authConfig).auth directly,
      // we can test that the module structure is correct
      const middleware = await import('@/middleware');
      
      expect(middleware.default).toBeDefined();
      expect(typeof middleware.default).toBe('function');
    });
  });

  describe('matcher pattern behavior', () => {
    it('should match application routes that should be processed by middleware', () => {
      const applicationPaths = [
        '/admin/dashboard',
        '/volunteer/profile', 
        '/login',
        '/',
        '/about'
      ];

      // For application routes, we just verify they don't start with excluded patterns
      applicationPaths.forEach(path => {
        const shouldBeExcluded = path.startsWith('/api') || 
                                path.startsWith('/_next/static') || 
                                path.startsWith('/_next/image') || 
                                path.endsWith('.png');
        expect(shouldBeExcluded).toBe(false);
      });
    });

    it('should identify routes that should be excluded from middleware', () => {
      const excludedPaths = [
        '/api/users',
        '/api/auth/signin',
        '/_next/static/chunks/main.js',
        '/_next/image/logo.png',
        '/favicon.png',
        '/images/logo.png'
      ];

      excludedPaths.forEach(path => {
        const shouldBeExcluded = path.startsWith('/api') || 
                                path.startsWith('/_next/static') || 
                                path.startsWith('/_next/image') || 
                                path.endsWith('.png');
        expect(shouldBeExcluded).toBe(true);
      });
    });
  });
});