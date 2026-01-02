# Mock API System

Hệ thống mock API được tổ chức theo từng feature để dễ dàng mở rộng và bảo trì.

## Cấu trúc thư mục

```
mock/
├── core/                    # Core system files
│   ├── router.ts            # Router để match routes
│   └── register-routes.ts   # Đăng ký tất cả routes từ features
├── data/                    # Mock data store (tổ chức theo feature)
│   ├── users.ts             # Users data và helpers
│   ├── posts.ts             # Posts data và helpers
│   ├── auth.ts              # Auth utilities (token generation)
│   └── index.ts             # Export tất cả
├── features/                # Mock handlers theo từng feature
│   ├── auth/
│   │   ├── handlers.ts      # Auth handlers
│   │   ├── routes.ts        # Auth routes
│   │   └── index.ts         # Export
│   ├── posts/
│   │   ├── handlers.ts      # Posts handlers
│   │   ├── routes.ts        # Posts routes
│   │   └── index.ts         # Export
│   └── users/
│       ├── handlers.ts      # Users handlers
│       ├── routes.ts        # Users routes
│       └── index.ts         # Export
├── types.ts                 # Shared types
├── config.ts               # Configuration
├── adapter.ts              # Axios adapter
├── index.ts                # Public API
└── README.md               # Documentation
```

## Cách thêm feature mới

### 1. Tạo thư mục feature

Tạo thư mục mới trong `features/`:

```bash
mkdir -p src/shared/api/mock/features/your-feature
```

### 2. Tạo handlers.ts

```typescript
/**
 * Your Feature Mock Handlers
 * FSD Layer: Shared
 * Feature: YourFeature
 */

import {
  MOCK_DELAY,
  logMockRequest,
  logMockResponse,
  simulateDelay,
} from '../../config';
import type { MockError, MockResponse } from '../../types';

export const handleYourEndpoint = async (
  data: YourDataType
): Promise<MockResponse<YourResponseType>> => {
  logMockRequest('POST', '/your-endpoint', data);

  await simulateDelay(MOCK_DELAY.AUTH);

  // Your logic here

  const response: MockResponse<YourResponseType> = {
    data: yourData,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('POST', '/your-endpoint', 200);
  return response;
};
```

### 3. Tạo routes.ts

```typescript
/**
 * Your Feature Mock Routes
 * FSD Layer: Shared
 * Feature: YourFeature
 */

import type { RouteMatch } from '../../types';
import { handleYourEndpoint } from './handlers';

export const yourFeatureRoutes: RouteMatch[] = [
  {
    pattern: /^\/your-endpoint$/,
    method: 'POST',
    handler: async (config) => handleYourEndpoint(config.data as YourDataType),
  },
];
```

### 4. Tạo index.ts

```typescript
/**
 * Your Feature Mock Feature
 * FSD Layer: Shared
 * Feature: YourFeature
 */

export * from './handlers';
export * from './routes';
```

### 5. Đăng ký routes

Thêm vào `core/register-routes.ts`:

```typescript
import { yourFeatureRoutes } from '../features/your-feature';

export const registerAllRoutes = (): void => {
  // ... existing routes
  mockRouter.register(yourFeatureRoutes);
};
```

### 6. Thêm mock data (nếu cần)

Nếu feature của bạn cần mock data, tạo file trong `data/`:

```typescript
// data/your-feature.ts
export interface MockYourData {
  id: string;
  name: string;
}

export const mockYourData: MockYourData[] = [{ id: '1', name: 'Example' }];

export const getYourDataById = (id: string): MockYourData | undefined => {
  return mockYourData.find((d) => d.id === id);
};
```

Sau đó export từ `data/index.ts`:

```typescript
export * from './your-feature';
```

## Best Practices

1. **Mỗi feature có folder riêng**: Tách biệt handlers và routes theo feature
2. **Data store tổ chức theo feature**: Mỗi feature có file data riêng trong `data/`
3. **Shared types**: Sử dụng types từ `types.ts` cho consistency
4. **Error handling**: Luôn throw `MockError` với status code và message rõ ràng
5. **Logging**: Sử dụng `logMockRequest` và `logMockResponse` cho debugging
6. **Delay simulation**: Sử dụng `simulateDelay` với `MOCK_DELAY` constants
7. **Import từ data/index**: Luôn import data từ `../../data` thay vì file cụ thể

## Test Accounts

- Email: `john@example.com`, Password: `123456`
- Email: `jane@example.com`, Password: `123456`
- Email: `bob@example.com`, Password: `password`
