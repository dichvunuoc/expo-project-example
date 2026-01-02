/**
 * Auth Mock Utilities
 * FSD Layer: Shared
 * Feature: Auth
 *
 * Auth-related utilities for mock system
 */

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate a mock JWT token
 * In production, this would come from the backend
 */
export const generateMockToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  );
  const signature = btoa(`mock-signature-${userId}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
};
