# Project Architecture Standards

This document defines the strict rules for data flow and component structure in this Expo Enterprise Project, combining **Feature-Sliced Design (FSD)** with **MVVM (Model-View-ViewModel)** pattern.

## Executive Summary

This architecture uses:

- **FSD (Feature-Sliced Design)**: Organizes code by features (slices), not file types
- **MVVM Pattern**: Separates UI (View) from business logic (ViewModel) and data (Model)
- **React Hooks**: ViewModels are implemented as Custom Hooks

```
FSD = City planning (districts, zones)
MVVM = Building code (structure of each building)
```

## 1. MVVM Mapping to FSD

| MVVM Component | Role                                      | FSD Segment                      | Example                           |
| -------------- | ----------------------------------------- | -------------------------------- | --------------------------------- |
| **View**       | Display UI, receive user input. NO logic. | `ui/` folder                     | `LoginForm.tsx`                   |
| **ViewModel**  | Handle events, call Model, transform data | `model/` folder (hooks)          | `useLoginViewModel.ts`            |
| **Model**      | Raw data, API calls, validation           | `api/` + `model/` (stores/types) | `signInUser.ts`, `loginSchema.ts` |

## 2. Golden Rule: Separation of Concerns

### View (ui/\*.tsx)

- ✅ ONLY contains JSX and styles
- ✅ Calls ViewModel hook
- ✅ Binds UI to ViewModel's state and actions
- ❌ NO `useEffect` with business logic
- ❌ NO direct API calls (`useQuery`, `useMutation`)
- ❌ NO complex `useState` with logic

```tsx
// ✅ CORRECT: View only calls ViewModel
export function LoginForm() {
  const { form, actions, state } = useLoginViewModel();
  return (
    <View>
      <ControlledInput control={form.control} name="email" />
      <Button onPress={actions.onSubmit} isLoading={state.isPending} />
    </View>
  );
}

// ❌ WRONG: View contains logic
export function LoginForm() {
  const mutation = useMutation(loginApi); // ❌ Direct API call
  const [email, setEmail] = useState(''); // ❌ Manual state
  const handleSubmit = () => { ... }; // ❌ Logic in View
}
```

### ViewModel (model/use\*ViewModel.ts)

- ✅ Contains ALL business logic
- ✅ Manages form state (React Hook Form)
- ✅ Calls API mutations/queries
- ✅ Handles validation
- ✅ Exposes clean interface to View

```tsx
// ✅ CORRECT ViewModel structure
export const useLoginViewModel = () => {
  const mutation = useSignInMutation();
  const { control, handleSubmit } = useForm();

  return {
    form: { control, errors },
    actions: { onSubmit: () => handleSubmit(mutation.mutate)() },
    state: { isPending: mutation.isPending, isError: mutation.isError },
  };
};
```

### Model (api/ + model/)

- API functions and TanStack Query hooks
- Zod schemas for validation
- TypeScript types
- Zustand stores (for global state)

## 3. Feature-Sliced Design Structure

```
src/
├── app/                    # Expo Router entry points (proxy to pages)
├── pages/                  # Page layouts (compose widgets/features)
├── widgets/                # Complex UI blocks (compose features)
├── features/               # Business features (user actions)
│   └── {feature_name}/
│       ├── ui/             # VIEW: Dumb components (JSX only)
│       │   └── FeatureForm.tsx
│       ├── model/          # VIEWMODEL + TYPES
│       │   ├── useFeatureViewModel.ts  # ViewModel hook
│       │   ├── schema.ts               # Zod validation
│       │   ├── types.ts                # TypeScript types
│       │   └── index.ts                # Barrel exports
│       ├── api/            # MODEL: API calls
│       │   ├── useFeatureMutation.ts   # TanStack Query
│       │   └── index.ts
│       └── index.ts        # Public API (what's exposed)
├── entities/               # Business entities (data definitions)
└── shared/                 # Reusable UI kits, utilities
```

## 4. Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Action                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  VIEW (ui/LoginForm.tsx)                                        │
│  - Captures user input                                          │
│  - Calls actions.onSubmit()                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  VIEWMODEL (model/useLoginViewModel.ts)                         │
│  - Validates form data (Zod)                                    │
│  - Calls mutation.mutate()                                      │
│  - Updates state (isPending, isError)                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  MODEL (api/useLoginMutation.ts)                                │
│  - Sends HTTP request                                           │
│  - Updates Zustand store on success                             │
│  - Handles navigation                                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  VIEW (re-renders with new state)                               │
│  - Shows loading spinner while isPending                        │
│  - Shows error message if isError                               │
│  - Navigates on success                                         │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Public API Rules

### Barrel Exports (index.ts)

Every feature MUST have an `index.ts` that controls what's exposed:

```tsx
// features/auth/sign-in-by-email/index.ts

// UI (View)
export { SignInForm } from './ui';

// Model (ViewModel + Schema)
export { useSignInViewModel, signInSchema } from './model';
export type { SignInFormData, SignInViewModelReturn } from './model';

// API (Model - Data Layer)
export { useSignInMutation } from './api';
```

### Import Rules

- ✅ Import from barrel: `import { SignInForm } from '@/features/auth/sign-in-by-email'`
- ❌ Deep import: `import { SignInForm } from '@/features/auth/sign-in-by-email/ui/SignInForm'`

## 6. ViewModel Interface Pattern

Every ViewModel should return a consistent interface:

```tsx
interface ViewModelReturn {
  // Form state (for form-based features)
  form?: {
    control: Control<FormData>;
    errors: FieldErrors<FormData>;
  };

  // Data from server (for data-fetching features)
  data?: {
    items: Item[];
    // ... other data
  };

  // Actions exposed to View
  actions: {
    onSubmit?: () => void;
    onRefresh?: () => void;
    // ... other actions
  };

  // UI state
  state: {
    isPending: boolean;
    isError: boolean;
    isLoading?: boolean;
    error: Error | null;
  };
}
```

## 7. Examples

### Feature with Form (Auth)

```
features/auth/sign-in-by-email/
├── ui/
│   └── SignInForm.tsx          # View: JSX only
├── model/
│   ├── useSignInViewModel.ts   # ViewModel: form + mutation logic
│   ├── schema.ts               # Model: Zod validation
│   └── index.ts
├── api/
│   └── signIn.ts               # Model: API call + mutation hook
└── index.ts
```

### Feature with Data List (Posts)

```
features/posts/list-posts/
├── ui/
│   ├── PostList.tsx            # View: receives data via props
│   └── PostItem.tsx            # View: pure presentational
├── model/
│   ├── usePostListViewModel.ts # ViewModel: fetching + state
│   ├── types.ts                # Model: TypeScript types
│   └── index.ts
├── api/
│   └── usePosts.ts             # Model: TanStack Query hook
└── index.ts
```

## 8. Tech Stack

| Layer        | Technology        | Purpose                         |
| ------------ | ----------------- | ------------------------------- |
| Routing      | Expo Router v4    | Navigation between Views        |
| Server State | TanStack Query v5 | Data fetching, caching (Model)  |
| Client State | Zustand           | Global state management (Model) |
| Forms        | React Hook Form   | Form state in ViewModel         |
| Validation   | Zod               | Schema validation (Model)       |
| Styling      | NativeWind v4     | View styling                    |

## 9. Testing Benefits

MVVM enables fast unit testing:

```tsx
// Test ViewModel logic WITHOUT rendering UI
describe('useSignInViewModel', () => {
  it('should validate email format', () => {
    const { result } = renderHook(() => useSignInViewModel());
    // Test form validation without UI
  });

  it('should call mutation on submit', () => {
    const { result } = renderHook(() => useSignInViewModel());
    act(() => result.current.actions.onSubmit());
    // Verify mutation was called
  });
});
```

## 10. Strict Rules (MUST Follow)

1. **View = Dumb**: No `useQuery`, `useMutation`, complex `useState`, or business `useEffect`
2. **ViewModel = Smart Hook**: All logic lives here, returns clean interface
3. **Model = Data**: API calls, validation schemas, types
4. **Public API**: Only import from `index.ts` barrel exports
5. **Proxy Routing**: `app/` folder only imports from `src/pages/`
6. **One ViewModel per Feature**: Each feature has its own ViewModel hook
