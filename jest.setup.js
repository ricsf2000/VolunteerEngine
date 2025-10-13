// Jest setup file for global test configuration

global.mockSession = (userId = 'test-user-id') => ({
  user: { id: userId }
});

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};