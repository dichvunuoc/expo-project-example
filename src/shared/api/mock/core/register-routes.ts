/**
 * Register All Mock Routes
 * FSD Layer: Shared
 *
 * This file registers all routes from all features.
 * Add new features here when creating new mock handlers.
 */

import { mockRouter } from './router';
import { authRoutes } from '../features/auth';
import { postsRoutes } from '../features/posts';
import { usersRoutes } from '../features/users';

/**
 * Register all feature routes
 * This is called once when the mock system is initialized
 */
export const registerAllRoutes = (): void => {
  // Register auth routes
  mockRouter.register(authRoutes);

  // Register posts routes
  mockRouter.register(postsRoutes);

  // Register users routes
  mockRouter.register(usersRoutes);

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(
      `[MOCK API] Registered ${mockRouter.getRoutes().length} routes from ${3} features`
    );
  }
};
