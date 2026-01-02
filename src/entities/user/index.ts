/**
 * User Entity (Public API)
 * FSD Layer: Entities
 *
 * Contains user-related types, UI components, and data fetching.
 */

// Model
export type { User, UserProfile } from './model';

// UI
export { UserAvatar, UserCard } from './ui';
export type { UserAvatarProps, UserCardProps } from './ui';

// API
export { useCurrentUserQuery, useUserQuery, userKeys } from './api';
