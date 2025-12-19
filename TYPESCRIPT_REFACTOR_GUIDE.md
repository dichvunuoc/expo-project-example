# TypeScript Refactoring Guide

## Overview

This document outlines the changes made to improve type safety and eliminate `any` types in the Expo project.

## Changes Made

### 1. Enhanced Auth Types (`src/features/auth/types.ts`)

**Added new interfaces:**

- `RegisterUserData`: For user registration with all required fields
- `ResetPasswordData`: For password reset functionality
- `ChangePasswordData`: For password change functionality
- Enhanced `User` interface with optional fields (avatar, timestamps)
- Enhanced `AuthResponse` with refresh token support

**Before:**

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
}
```

**After:**

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
  phone?: string;
  avatar?: string;
}
```

### 2. Fixed Auth API (`src/features/auth/api/index.ts`)

**Replaced `any` types with proper interfaces:**

**Before:**

```typescript
export const registerUser = async (userData: any) => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};
```

**After:**

```typescript
export const registerUser = async (
  userData: RegisterUserData
): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};
```

**Added new API functions:**

- `refreshToken()`: Token refresh functionality
- `resetPassword()`: Password reset
- `changePassword()`: Password change
- `getCurrentUser()`: Get current user data
- `logout()`: Logout functionality

### 3. Validation Utilities (`src/utils/validation.ts`)

**Comprehensive validation functions with proper types:**

```typescript
export const isValidEmail = (email: string): boolean => {
  // Implementation with regex validation
};

export const isValidPassword = (password: string): ValidationResult => {
  // Returns validation result with errors array
};

export const isValidPhone = (phone: string): boolean => {
  // Supports international phone formats
};
```

**Features:**

- Email validation with international character support
- Password validation with comprehensive security rules
- Phone number validation (international format)
- Username validation with customizable rules
- URL, date, and credit card validation
- Generic field validation with custom rules

### 4. Storage Service (`src/services/storage.ts`)

**Type-safe storage wrapper with MMKV integration:**

```typescript
export class StorageService implements IStorageService {
  async set<T extends StorageValue>(
    key: StorageKey | string,
    value: T
  ): Promise<void>;
  async get<T extends StorageValue>(
    key: StorageKey | string
  ): Promise<T | null>;
  async remove(key: StorageKey | string): Promise<void>;
  async clear(): Promise<void>;
}
```

**Features:**

- Type-safe storage operations
- Predefined storage keys constants
- Specialized storage modules:
  - `AuthStorage`: Token and user data management
  - `AppStorage`: Settings, preferences, and app state
- JSON serialization/deserialization
- Error handling and logging
- Storage export/import functionality

### 5. Error Handling System (`src/lib/error-handler.ts`)

**Comprehensive error handling with custom error classes:**

```typescript
export class APIError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: string;

  getUserMessage(): string;
  isClientError(): boolean;
  isServerError(): boolean;
  isNetworkError(): boolean;
  isAuthError(): boolean;
}
```

**Specialized error classes:**

- `NetworkError`: Network-related issues
- `ValidationError`: Form validation errors
- `AuthenticationError`: Auth failures
- `AuthorizationError`: Permission issues
- `NotFoundError`: Missing resources
- `RateLimitError`: Rate limiting
- `ServerError`: Server-side errors

**Error handler utilities:**

- `ErrorHandler.handle()`: Convert unknown errors to APIError
- `ErrorHandler.log()`: Structured error logging
- `ErrorHandler.shouldRetry()`: Retry logic
- `ErrorHandler.shouldLogout()`: Auth error detection
- `useErrorHandler()` hook for React components

### 6. Enhanced Axios Configuration (`src/lib/axios.ts`)

**Improved with proper type safety and error handling:**

```typescript
// Request interceptor with proper typing
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Type-safe configuration
  }
);

// Response wrapper functions
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T>
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T>
```

**Features:**

- Proper TypeScript types for interceptors
- Comprehensive error handling
- Request/response logging in development
- Network error detection
- Timeout handling
- Automatic token injection
- Auth error detection and logout

## Usage Examples

### 1. Using Validation Utilities

```typescript
import { isValidEmail, isValidPassword } from '@/utils/validation';

// Email validation
if (isValidEmail(email)) {
  // Email is valid
}

// Password validation with error details
const passwordResult = isValidPassword(password);
if (!passwordResult.isValid) {
  console.log('Password errors:', passwordResult.errors);
}
```

### 2. Using Storage Service

```typescript
import { storageService, AuthStorage, AppStorage } from '@/services/storage';

// Basic storage operations
await storageService.set('user_data', { name: 'John', age: 30 });
const userData = await storageService.get<{ name: string; age: number }>(
  'user_data'
);

// Auth-specific storage
await AuthStorage.setToken('jwt-token');
const token = await AuthStorage.getToken();
await AuthStorage.clearAuthData();

// App settings
await AppStorage.setTheme('dark');
const theme = await AppStorage.getTheme();
```

### 3. Using Error Handler

```typescript
import { ErrorHandler, useErrorHandler } from '@/lib/error-handler';

// Direct error handling
try {
  await someApiCall();
} catch (error) {
  const apiError = ErrorHandler.handle(error);
  if (apiError.isNetworkError()) {
    // Handle network error
  }
}

// Using React hook
const MyComponent = () => {
  const { handleError, handleAsyncOperation } = useErrorHandler();

  const handleAction = async () => {
    const { data, error } = await handleAsyncOperation(() => apiCall());
    if (error) {
      showError(error.getUserMessage());
    }
  };
};
```

### 4. Using Enhanced API

```typescript
import { get, post, put } from '@/lib/axios';
import { APIError } from '@/lib/error-handler';

try {
  const users = await get<User[]>('/users');
  const newUser = await post<User>('/users', userData);
  const updatedUser = await put<User>(`/users/${id}`, updateData);
} catch (error) {
  if (error instanceof APIError) {
    if (error.isAuthError()) {
      // Handle auth error
      navigate('/login');
    }
  }
}
```

## Migration Steps

### 1. Update Existing API Calls

Replace manual API calls with typed wrapper functions:

```typescript
// Before
const response = await apiClient.post('/auth/login', credentials);
const data = response.data;

// After
import { post } from '@/lib/axios';
const data = await post<AuthResponse>('/auth/login', credentials);
```

### 2. Replace Manual Validation

Use validation utilities instead of manual checks:

```typescript
// Before
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError('Invalid email');
}

// After
import { isValidEmail } from '@/utils/validation';
if (!isValidEmail(email)) {
  setError('Invalid email');
}
```

### 3. Replace Direct Storage Access

Use typed storage service instead of direct MMKV calls:

```typescript
// Before
import { createMMKV } from 'react-native-mmkv';
const storage = createMMKV();
storage.set('token', 'jwt-token');

// After
import { AuthStorage } from '@/services/storage';
await AuthStorage.setToken('jwt-token');
```

### 4. Update Error Handling

Use structured error handling:

```typescript
// Before
try {
  await apiCall();
} catch (error) {
  console.error(error);
  Alert.alert('Error', 'Something went wrong');
}

// After
import { ErrorHandler } from '@/lib/error-handler';
try {
  await apiCall();
} catch (error) {
  const apiError = ErrorHandler.handle(error);
  Alert.alert('Error', apiError.getUserMessage());
}
```

## Benefits

1. **Type Safety**: Eliminated all `any` types with proper TypeScript interfaces
2. **Error Handling**: Comprehensive error management with user-friendly messages
3. **Validation**: Robust validation utilities for common data types
4. **Storage**: Type-safe persistent storage with structured data management
5. **API**: Clean API layer with automatic error handling and type safety
6. **Maintainability**: Better code organization and documentation
7. **Developer Experience**: Improved IntelliSense and compile-time error detection

## Next Steps

1. **Add Tests**: Create unit tests for all new utilities
2. **Documentation**: Add inline documentation for complex functions
3. **Performance**: Monitor performance impact of new validation layers
4. **Integration**: Update existing components to use new utilities
5. **CI/CD**: Add TypeScript strict mode to build pipeline

## Troubleshooting

### Common Issues

1. **MMKV Methods**: Use `remove()` instead of `delete()` for MMKV storage
2. **Axios Types**: Use `InternalAxiosRequestConfig` for request interceptors
3. **Async Storage**: Ensure proper async/await usage with storage operations
4. **Error Handling**: Always wrap API calls in try-catch blocks

### Type Errors

- Ensure all interfaces export properly from type files
- Check for circular dependencies in imports
- Verify generic type parameters in utility functions
- Use proper typing for React Hook Form integration

This refactoring significantly improves the project's type safety, maintainability, and developer experience while following modern React Native and TypeScript best practices.
