// Jest setup file for global test configuration

jest.setTimeout(30000);

global.mockSession = (userId = 'test-user-id') => ({
  user: { id: userId }
});

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
