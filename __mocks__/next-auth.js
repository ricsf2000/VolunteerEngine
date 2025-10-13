// Mock NextAuth for Jest tests
const mockNextAuth = jest.fn();

const mockProviders = {
  Credentials: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials'
  }))
};

module.exports = {
  __esModule: true,
  default: mockNextAuth,
  providers: mockProviders
};

module.exports.NextAuth = mockNextAuth;
module.exports.providers = mockProviders;