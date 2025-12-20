# Project Architecture Standards

This document defines the strict rules for data flow and component structure in this Expo Enterprise Project.

## 1. Golden Rule: Unidirectional Data Flow

Data MUST flow in one direction:
**API -> Hook (TanStack Query) -> Screen (Smart Component) -> UI (Dumb Component)**

- **NEVER** call API functions directly inside a UI Component.
- **NEVER** use `useEffect` for data fetching. always use `useQuery` or `useMutation`.
- **NEVER** put business logic (transformations, filtering) inside the UI layer. Do it in the Hook or Selector.

## 2. Feature-First Directory Structure

Every feature (e.g., `auth`, `products`, `demo`) MUST follow this structure in `src/features/{feature_name}`:

```
src/features/demo/
├── api/            # Raw API calls (Axios)
│   └── index.ts
├── hooks/          # React Query wrappers & Business Logic
│   └── usePosts.ts
├── components/     # Presentational Components (No API calls here!)
│   ├── PostList.tsx
│   └── PostItem.tsx
├── store/          # Zustand Store (Client State only)
└── types.ts        # Domain Interfaces
```

## 3. Screen vs. Component

### Screens (`app/*`)

- **Role**: The "Container" or "Smart Component".
- **Responsibilities**:
  - Read URL parameters (`useLocalSearchParams`).
  - Call Data Hooks (`usePosts`).
  - Pass data to components via Props.
  - Handle navigation.
- **Restrictions**: Should contain minimal UI markup. Primarily manages layout and data passing.

### Components (`src/components/*`)

- **Role**: "Presentational" or "Dumb Component".
- **Responsibilities**:
  - Receive data via `props`.
  - Emit events via callbacks (e.g., `onPress`).
  - Render UI using NativeWind.
- **Restrictions**: MUST NOT know about API or Store. PURE functions of their props.

## 4. Styling (NativeWind)

- Use `className` for all styling.
- Use `src/components/ui` for atomic elements (Button, Input).
- Avoid inline `style={{}}` unless absolutely necessary for dynamic values.

## 5. Strict Typing

- All API responses must be typed.
- All Component props must be typed interfaces.
- No `any` allowed.
