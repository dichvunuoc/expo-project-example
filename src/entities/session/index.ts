/**
 * Session Entity (Public API)
 * FSD Layer: Entities
 *
 * Manages authentication session state.
 */

export { useSessionStore } from './model';
export type {
  Session,
  AuthResponse,
  LoginCredentials,
  RegisterUserData,
} from './model';
