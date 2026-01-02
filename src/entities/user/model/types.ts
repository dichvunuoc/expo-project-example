/**
 * User Entity Types
 * FSD Layer: Entities
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  location?: string;
}
