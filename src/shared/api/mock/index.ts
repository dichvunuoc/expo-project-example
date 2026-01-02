/**
 * Mock API System (Public API)
 * FSD Layer: Shared
 *
 * Centralized mock API system for development and testing.
 *
 * Usage:
 * 1. Set EXPO_PUBLIC_MOCK_API=true in .env to enable mock mode
 * 2. Or mock mode auto-enables when no EXPO_PUBLIC_API_URL is set in dev
 *
 * Test accounts:
 * - Email: john@example.com, Password: 123456
 * - Email: jane@example.com, Password: 123456
 * - Email: bob@example.com, Password: password
 */

// Configuration
export { MOCK_DELAY, isMockEnabled, simulateDelay } from './config';

// Adapter setup
export { createMockAdapter, setupMockAdapter } from './adapter';

// Mock data (for testing)
export {
  findUserByEmail,
  findUserById,
  getAllPosts,
  getPostById,
  isEmailRegistered,
  mockPosts,
  mockUsers,
  validateCredentials,
  type MockPost,
  type MockUser,
} from './data';

// Types
export type { HttpMethod, MockError, MockResponse, RouteMatch } from './types';

// Router
export { matchRoute, mockRouter } from './core/router';

// Feature handlers (for direct use in tests)
export {
  handleGetMe,
  handleLogin,
  handleLogout,
  handleRegister,
  type RegisterData,
} from './features/auth';

export { handleGetPost, handleGetPosts } from './features/posts';

export { handleGetUser } from './features/users';
