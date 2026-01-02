/**
 * Users Mock Data
 * FSD Layer: Shared
 * Feature: Users
 *
 * Mock data and helpers for users
 */

import type { User } from '@/entities/user';

// ============================================================================
// TYPES
// ============================================================================

export interface MockUser extends User {
  password: string; // Only in mock, never in real API response
}

// ============================================================================
// DATA
// ============================================================================

export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?u=john',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?u=jane',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-20T14:45:00.000Z',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password',
    avatar: undefined,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find user by email
 */
export const findUserByEmail = (email: string): MockUser | undefined => {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * Find user by ID
 */
export const findUserById = (id: string): MockUser | undefined => {
  return mockUsers.find((u) => u.id === id);
};

/**
 * Validate user credentials
 */
export const validateCredentials = (
  email: string,
  password: string
): MockUser | null => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

/**
 * Check if email is already registered
 */
export const isEmailRegistered = (email: string): boolean => {
  return mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * Create a new mock user (for sign up)
 */
export const createMockUser = (
  name: string,
  email: string,
  password: string
): MockUser => {
  const newUser: MockUser = {
    id: String(mockUsers.length + 1),
    name,
    email,
    password,
    avatar: `https://i.pravatar.cc/150?u=${email}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
};

/**
 * Get user without sensitive data (password)
 */
export const sanitizeUser = (user: MockUser): User => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...safeUser } = user;
  return safeUser;
};
