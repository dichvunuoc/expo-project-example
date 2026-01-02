/**
 * Mock API Router
 * FSD Layer: Shared
 *
 * Central router that registers and matches routes from all features
 */

import type { HttpMethod, RouteMatch } from '../types';

/**
 * Extract route params from URL using pattern
 */
const extractParams = (
  url: string,
  pattern: RegExp
): Record<string, string> | null => {
  const match = url.match(pattern);
  if (!match) return null;
  return match.groups || {};
};

/**
 * Route registry
 * All features register their routes here
 */
class MockRouter {
  private routes: RouteMatch[] = [];

  /**
   * Register routes from a feature
   */
  register(routes: RouteMatch[]): void {
    this.routes.push(...routes);
  }

  /**
   * Match request to handler
   */
  match(
    method: string,
    url: string
  ): { handler: RouteMatch['handler']; params: Record<string, string> } | null {
    const upperMethod = method.toUpperCase() as HttpMethod;

    for (const route of this.routes) {
      if (route.method !== upperMethod) continue;

      const params = extractParams(url, route.pattern);
      if (params !== null) {
        return { handler: route.handler, params };
      }

      // Check if URL matches without params
      if (route.pattern.test(url)) {
        return { handler: route.handler, params: {} };
      }
    }

    return null;
  }

  /**
   * Get all registered routes (for debugging)
   */
  getRoutes(): RouteMatch[] {
    return [...this.routes];
  }
}

// Singleton instance
export const mockRouter = new MockRouter();

/**
 * Match route (exported for backward compatibility)
 */
export const matchRoute = (
  method: string,
  url: string
): {
  handler: RouteMatch['handler'];
  params: Record<string, string>;
} | null => {
  return mockRouter.match(method, url);
};
