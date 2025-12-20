# Hướng Dẫn Cấu Hình Deep Linking & Universal Links

Tài liệu này hướng dẫn chi tiết cách cấu hình Deep Linking (Custom Scheme) và Universal Links (iOS) / App Links (Android) cho dự án Expo.

## 1. Tổng Quan

Có 2 loại liên kết sâu (Deep Link) chính:

1.  **Custom Scheme** (`scheme://path`):
    - Ví dụ: `com-techgen-template://user/123`
    - **Ưu điểm:** Dễ cấu hình, không cần domain, hoạt động ngay lập tức khi cài App.
    - **Nhược điểm:** Nếu chưa cài App, link sẽ bị lỗi. Không thân thiện với người dùng web.
2.  **Universal Links / App Links** (`https://domain.com/path`):
    - Ví dụ: `https://demo.cudanso.vn/user/123`
    - **Ưu điểm:** Trải nghiệm tốt nhất. Có App -> Mở App. Không có App -> Mở Web.
    - **Nhược điểm:** Cần sở hữu domain, phải cấu hình file xác thực trên server (Strict).

---

## 2. Cấu Hình Dự Án (Client Side)

### Bước 1: Cài đặt biến môi trường

Mở file `.env` và cập nhật các biến sau:

```properties
# Custom Scheme (cho nội bộ App)
EXPO_PUBLIC_SCHEME=com-techgen-template

# Domain cho Universal/App Links (không bao gồm https://)
EXPO_PUBLIC_DEEP_LINK_HOST=demo.cudanso.vn

# Bundle ID (Phải khớp với file cấu hình server sau này)
EXPO_PUBLIC_IOS_BUNDLE_ID=com.techgen.expo
EXPO_PUBLIC_ANDROID_PACKAGE=com.techgen.expo
```

### Bước 2: Cấu hình `app.config.js`

File config đã được thiết lập sẵn để đọc từ `.env`. Dưới đây là các phần quan trọng:

**Android (App Links):**

```javascript
android: {
  package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE,
  intentFilters: [
    {
      action: 'VIEW',
      autoVerify: true, // Quan trọng: Yêu cầu Android tự động xác thực domain
      data: {
        scheme: 'https',
        host: process.env.EXPO_PUBLIC_DEEP_LINK_HOST, // demo.cudanso.vn
        pathPattern: '.*', // Bắt tất cả các đường dẫn
      },
      category: ['BROWSABLE', 'DEFAULT'],
    },
    // ... custom scheme configuration
  ],
}
```

**iOS (Universal Links):**

```javascript
ios: {
  bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_ID,
  associatedDomains: [
    // Định dạng: applinks:<domain>
    `applinks:${process.env.EXPO_PUBLIC_DEEP_LINK_HOST}`,
  ],
}
```

### Bước 3: Rebuild Native Code

Sau khi thay đổi cấu hình, bạn **bắt buộc** phải chạy lại lệnh prebuild:

```bash
npx expo prebuild --clean
npx expo run:android # hoặc run:ios
```

---

## 3. Cấu Hình Server (Server Side) - BẮT BUỘC cho Production

Để Universal Links hoạt động trên máy người dùng thật (tải từ Store), bạn phải upload 2 file xác thực lên server của domain `demo.cudanso.vn`.

### Cho Android (`.well-known/assetlinks.json`)

File này giúp Android xác nhận rằng bạn sở hữu cả Website và App.

- **Đường dẫn:** `https://demo.cudanso.vn/.well-known/assetlinks.json`
- **Nội dung:**

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.techgen.expo",
      "sha256_cert_fingerprints": [
        "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
      ]
    }
  }
]
```

**Lưu ý quan trọng:**

- Mã `sha256_cert_fingerprints` ở trên là của **Debug Keystore** (chỉ dùng để test dev).
- Khi release lên CH Play, bạn phải thay bằng SHA-256 của **Release Keystore** hoặc lấy trong **Google Play Console** -> **Release** -> **App Integrity**.

### Cho iOS (`.well-known/apple-app-site-association`)

File này giúp iOS xác nhận liên kết.

- **Đường dẫn:** `https://demo.cudanso.vn/.well-known/apple-app-site-association` (Không có đuôi .json)
- **Nội dung:**

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "<TeamID>.com.techgen.expo",
        "paths": ["*"]
      }
    ]
  }
}
```

- Thay `<TeamID>` bằng Apple Team ID của bạn (lấy tại [developer.apple.com](https://developer.apple.com/account)).

---

## 4. Kiểm Thử (Testing)

### Custom Scheme

Hoạt động ngay trên máy ảo/thật mà không cần server.

```bash
# Android
npx uri-scheme open "com-techgen-template://user/123" --android

# iOS
npx uri-scheme open "com-techgen-template://user/123" --ios
```

### Universal Links / App Links

**Lưu ý:** Gõ link trực tiếp vào thanh địa chỉ trình duyệt sẽ **KHÔNG** mở App (đây là hành vi mặc định của trình duyệt). Bạn phải click vào link từ một nơi khác (Note, Messenger, trang HTML test).

**Test trên Android (Giả lập Click):**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "https://demo.cudanso.vn/user/123" com.techgen.expo
```

---

## 5. Xử Lý Trong Code (React Native)

Sử dụng `expo-linking` để bắt link khi App khởi động hoặc đang chạy ngầm.

`src/hooks/useDeepLink.ts` (ví dụ):

```typescript
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

export function useDeepLink() {
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      const { hostname, path, queryParams } = Linking.parse(url);
      console.log('App opened with URL:', url);
      // Xử lý điều hướng tại đây
    }
  }, [url]);
}
```

Trong dự án này, việc điều hướng được xử lý tự động bởi `expo-router`. Bạn chỉ cần tạo cấu trúc thư mục tương ứng với path:

- URL: `.../user/123`
- File: `app/user/[userId].tsx`
