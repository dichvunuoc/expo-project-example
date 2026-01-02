# Expo Techgen Template

A production-ready Expo React Native template implementing **Feature-Sliced Design (FSD)** architecture with **MVVM** pattern.

## Features

- **FSD Architecture** - Scalable, maintainable folder structure
- **MVVM Pattern** - Clean separation of View, ViewModel, and Model
- **TypeScript** - Full type safety with strict mode
- **NativeWind** - Tailwind CSS for React Native styling
- **TanStack Query** - Powerful data fetching with offline support
- **Zustand** - Lightweight state management with MMKV persistence
- **React Hook Form + Zod** - Form handling with validation
- **Expo Router** - File-based routing with deep linking
- **Sentry** - Error tracking and monitoring
- **Biometric Auth** - Face ID / Touch ID support

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd expo-project-example

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Start development server
yarn start
```

### Running on Device/Emulator

```bash
# iOS
yarn ios

# Android
yarn android

# Web
yarn web
```

## Project Structure

```
src/
├── app/                    # App Layer - Expo Router pages
│   ├── (auth)/            # Auth group routes
│   ├── (tabs)/            # Tab navigation routes
│   └── _layout.tsx        # Root layout
│
├── core/                   # Core Layer - App configuration
│   ├── providers/         # React providers
│   ├── styles/            # Global styles
│   └── types/             # Global type definitions
│
├── pages/                  # Pages Layer - Full-screen components
│   ├── home/
│   ├── profile/
│   └── sign-in/
│
├── widgets/               # Widgets Layer - Complex UI compositions
│   ├── layout-header/
│   ├── network-status/
│   └── post-feed/
│
├── features/              # Features Layer - User interactions
│   ├── auth/
│   │   ├── sign-in-by-email/
│   │   ├── sign-up-by-email/
│   │   └── sign-out/
│   └── posts/
│       └── list-posts/
│
├── entities/              # Entities Layer - Business models
│   ├── session/
│   └── user/
│
└── shared/                # Shared Layer - Reusable utilities
    ├── api/               # API client, query client
    ├── lib/               # Utilities, hooks
    ├── ui/                # UI components
    ├── theme/             # Theme configuration
    └── assets/            # Images, fonts
```

## Architecture

### FSD (Feature-Sliced Design)

This template follows FSD methodology with strict layer dependency rules:

```
App → Pages → Widgets → Features → Entities → Shared
```

Each layer can only import from layers below it.

### MVVM Pattern

Features implement MVVM pattern:

```typescript
// View - Dumb component, JSX only
export function SignInForm() {
  const { form, actions, state } = useSignInViewModel();
  return <View>...</View>;
}

// ViewModel - Business logic hook
export const useSignInViewModel = () => {
  return {
    form: { control, errors },
    actions: { onSubmit },
    state: { isPending, isError, error }
  };
};

// Model - Schemas and API
export const signInSchema = z.object({...});
export const useSignInMutation = () => useMutation({...});
```

## UI Components

Available components in `@/shared/ui`:

| Component | Description                                              |
| --------- | -------------------------------------------------------- |
| `Button`  | Primary, secondary, outline, ghost, destructive variants |
| `Input`   | Text input with label, error, controlled form support    |
| `Text`    | Typography with variants, sizes, weights                 |
| `Card`    | Container with variants and padding options              |
| `Box`     | Flexible View wrapper                                    |
| `Badge`   | Status badges, notification counts                       |
| `Modal`   | Modal dialogs with confirm variant                       |
| `Toast`   | Toast notifications with provider                        |
| `Icon`    | Vector icons wrapper                                     |

### Usage Example

```tsx
import { Button, Input, Card, Text, useToast } from '@/shared/ui';

function MyComponent() {
  const toast = useToast();

  return (
    <Card variant="elevated">
      <Text size="lg" weight="bold">
        Title
      </Text>
      <Input label="Email" placeholder="Enter email" />
      <Button label="Submit" onPress={() => toast.success('Saved!')} />
    </Card>
  );
}
```

## State Management

### Session Store (Zustand)

```typescript
import { useSessionStore } from '@/entities/session';

function Profile() {
  const { user, isAuthenticated, signOut } = useSessionStore();

  if (!isAuthenticated) return <LoginPrompt />;

  return <ProfileView user={user} onSignOut={signOut} />;
}
```

### Data Fetching (TanStack Query)

```typescript
import { usePostsQuery } from '@/features/posts/list-posts/api';

function Posts() {
  const { data, isLoading, refetch } = usePostsQuery();

  if (isLoading) return <Loading />;

  return <PostList posts={data} onRefresh={refetch} />;
}
```

## Testing

```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test:coverage

# CI mode
yarn test:ci
```

### Test Structure

```
src/
├── shared/ui/__tests__/
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   └── ...
├── shared/lib/hooks/__tests__/
│   └── useNetworkStatus.test.ts
├── features/auth/sign-in-by-email/model/__tests__/
│   └── useSignInViewModel.test.ts
└── entities/session/model/__tests__/
    └── session.store.test.ts
```

## Environment Variables

Create `.env` file based on `.env.example`:

```env
# App Configuration
EXPO_PUBLIC_APP_NAME=MyApp
EXPO_PUBLIC_SLUG=my-app
EXPO_PUBLIC_SCHEME=myapp

# API
EXPO_PUBLIC_API_URL=https://api.example.com

# Sentry (Production)
EXPO_PUBLIC_SENTRY_DSN=

# Storage Encryption
EXPO_PUBLIC_STORAGE_KEY=your-256-bit-key

# EAS
EAS_PROJECT_ID=your-project-id
```

## Scripts

| Script            | Description             |
| ----------------- | ----------------------- |
| `yarn start`      | Start Expo dev server   |
| `yarn ios`        | Run on iOS simulator    |
| `yarn android`    | Run on Android emulator |
| `yarn web`        | Run on web browser      |
| `yarn test`       | Run tests               |
| `yarn lint`       | Run ESLint              |
| `yarn lint:fix`   | Fix ESLint errors       |
| `yarn format`     | Format with Prettier    |
| `yarn type-check` | TypeScript check        |

## Code Quality

This template includes:

- **ESLint** - Strict linting rules
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Commitlint** - Conventional commits

### Commit Message Format

```
type(scope): subject

# Examples:
feat(auth): add biometric login
fix(ui): button loading state
docs: update README
```

## Deep Linking

Configured for both iOS Universal Links and Android App Links:

```typescript
// Supported routes
expoapp://user/123
expoapp://product/456
https://yourdomain.com/user/123
```

Configure domains in `app.config.js`.

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Contributing

1. Create feature branch from `main`
2. Follow FSD architecture and MVVM pattern
3. Add tests for new features
4. Run `yarn lint` and `yarn test`
5. Submit PR with conventional commit messages

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
