Báo cáo Kiến trúc Toàn diện: Thiết kế và Triển khai Dự án Expo React Native Mẫu Mực cho Quy mô Doanh nghiệp (2025)
Tóm tắt Điều hành
Báo cáo này cung cấp một bản thiết kế kiến trúc chi tiết và toàn diện cho việc phát triển ứng dụng di động đa nền tảng (Cross-platform) sử dụng React Native và hệ sinh thái Expo trong năm 2025. Được biên soạn dựa trên yêu cầu về một "thiết kế hợp lý" (reasonable design), tài liệu này không chỉ đơn thuần cung cấp một cấu trúc thư mục, mà còn phân tích sâu sắc các quyết định kỹ thuật, sự lựa chọn công nghệ, và các mẫu thiết kế (design patterns) cần thiết để đảm bảo tính mở rộng, khả năng bảo trì và hiệu năng tối ưu.
Trong bối cảnh công nghệ năm 2025, việc phát triển ứng dụng Expo đã chuyển dịch mạnh mẽ sang mô hình "File-based Routing" (Định tuyến dựa trên tệp tin) với Expo Router v4, sử dụng kiến trúc tạo mã tự nhiên (Continuous Native Generation - CNG), và áp dụng các công cụ styling tại thời điểm biên dịch (compile-time) như NativeWind v4. Báo cáo này đề xuất một kiến trúc lai "Pragmatic Clean Architecture" (Kiến trúc Sạch Thực dụng), kết hợp sự chặt chẽ của lý thuyết phân tách mối quan tâm (Separation of Concerns) với tốc độ phát triển thực tế của các dự án khởi nghiệp và doanh nghiệp hiện đại.
Tài liệu được chia thành các chương chuyên sâu, bao trùm từ việc thiết lập môi trường, cấu hình tooling, chiến lược quản lý trạng thái, đến tối ưu hóa hiệu năng và kiểm thử tự động, nhằm cung cấp một lộ trình rõ ràng cho việc xây dựng một "Project Template" chuẩn mực.
Chương 1: Sự Chuyển dịch Kiến trúc và Bối cảnh Công nghệ 2025
Để xác định thế nào là một thiết kế "hợp lý" trong năm 2025, chúng ta cần thấu hiểu sự tiến hóa của nền tảng React Native và Expo. Những mô hình từng được coi là chuẩn mực vào năm 2020 hay 2023 hiện đã trở nên lỗi thời hoặc không còn tối ưu.
1.1 Kỷ nguyên của "New Architecture" và Expo SDK 52+
React Native đã hoàn tất quá trình chuyển đổi sang "New Architecture" (Kiến trúc Mới) với sự mặc định hóa của Fabric (hệ thống render mới viết bằng C++) và TurboModules (hệ thống giao tiếp native mới). Điều này loại bỏ "Bridge" (cầu nối) cũ kỹ vốn là nút thắt cổ chai về hiệu năng, cho phép JavaScript giao tiếp đồng bộ với Native.1
Expo SDK 52+ không chỉ hỗ trợ đầy đủ Kiến trúc Mới mà còn đưa khái niệm "Bridgeless Mode" trở thành tiêu chuẩn. Điều này đặt ra yêu cầu cơ bản cho bất kỳ dự án mẫu nào: Phải tương thích với Native Modules thông qua Config Plugins thay vì sửa đổi thủ công mã nguồn iOS/Android.
Việc sử dụng Expo Prebuild (CNG) cho phép chúng ta duy trì một dự án "Managed" (được quản lý) nhưng vẫn có toàn quyền truy cập vào các API native. Đây là nền tảng của một thiết kế hợp lý: giữ cho mã nguồn sạch sẽ (chỉ JS/TS) trong khi vẫn giữ được sức mạnh của native app.2
1.2 Sự trỗi dậy của File-Based Routing (Định tuyến dựa trên tệp tin)
Sự thay đổi lớn nhất về mặt cấu trúc dự án là sự thay thế của React Navigation (theo phong cách mệnh lệnh - imperative) bằng Expo Router (theo phong cách khai báo dựa trên tệp tin - file-based).
Trước đây, điều hướng (Navigation) thường được định nghĩa tập trung trong một file App.tsx hoặc Navigation.tsx, dẫn đến việc file này phình to mất kiểm soát và khó khăn trong việc Deep Linking (liên kết sâu). Expo Router, lấy cảm hứng từ Next.js, biến cấu trúc thư mục thành cấu trúc điều hướng. Điều này buộc kiến trúc dự án phải thay đổi căn bản: Thư mục /app trở thành nơi chứa các logic điều hướng, trong khi logic nghiệp vụ phải được tách biệt hoàn toàn sang /src để tránh sự ràng buộc chặt chẽ (tight coupling).4
1.3 Lựa chọn Công nghệ Cốt lõi cho "Mẫu Project"
Dựa trên phân tích các xu hướng và thực tiễn tốt nhất 6, bộ công nghệ (stack) được đề xuất cho dự án mẫu này bao gồm:

Thành phần
Công nghệ Lựa chọn
Lý do và Phân tích Chuyên sâu
Framework
Expo SDK 52+
Hỗ trợ Prebuild, New Architecture, và quy trình phát triển nhất quán trên cả iOS, Android và Web.
Ngôn ngữ
TypeScript 5.x
Bắt buộc cho các dự án quy mô lớn để đảm bảo an toàn kiểu dữ liệu (Type Safety) và hỗ trợ refactoring.8
Navigation
Expo Router v4
Cung cấp Deep Linking tự động, hỗ trợ SEO cho Web, và giảm thiểu boilerplate code so với React Navigation thuần túy.9
Styling
NativeWind v4
Sử dụng Tailwind CSS nhưng biên dịch thành StyleSheet native thông qua Babel. Phiên bản v4 cải thiện hiệu năng vượt trội và hỗ trợ biến CSS (CSS variables) cho theming.11
Client State
Zustand
Thay thế Redux cồng kềnh. Zustand cung cấp API tối giản dựa trên Hooks, không cần Provider bọc toàn ứng dụng, giúp giảm thiểu re-render không cần thiết.7
Server State
TanStack Query
Quản lý caching, deduplication, và đồng bộ dữ liệu server. Việc tách biệt Client State và Server State là chìa khóa của kiến trúc hiện đại.7
Validation
Zod
Schema validation mạnh mẽ, kết hợp hoàn hảo với TypeScript để đảm bảo tính toàn vẹn dữ liệu từ API hoặc Form nhập liệu.12
Storage
MMKV
Giải pháp lưu trữ Key-Value nhanh nhất hiện nay, thay thế cho AsyncStorage chậm chạp, đặc biệt quan trọng cho việc lưu trữ Token xác thực.2

Sự kết hợp này tạo ra một "Golden Stack" (Bộ công nghệ vàng) cân bằng giữa trải nghiệm nhà phát triển (DX) và hiệu năng người dùng cuối (UX).
Chương 2: Thiết Kế Cấu Trúc Thư Mục và Phân Tách Mối Quan Tâm
Một thiết kế "hợp lý" không chỉ là việc sắp xếp các file cho gọn mắt, mà là sự phản ánh của luồng dữ liệu và trách nhiệm của từng module. Chúng ta sẽ áp dụng mô hình "Feature-First" (Ưu tiên Tính năng) kết hợp với sự phân tách rõ ràng giữa lớp Ứng dụng (App Layer) và lớp Logic (Domain Layer).
2.1 Phân tích Cấu trúc Cấp cao: Cuộc chiến /app vs /src
Trong các tài liệu hướng dẫn cũ, bạn thường thấy mã nguồn nằm rải rác ở thư mục gốc. Tuy nhiên, với Expo Router, thực tiễn tốt nhất là sử dụng thư mục /src để chứa toàn bộ mã nguồn logic, và chỉ sử dụng /app cho việc định tuyến.4
Dưới đây là sơ đồ cây thư mục chi tiết cho dự án mẫu:
/expo-enterprise-template
├── /.husky # Git hooks (pre-commit, commit-msg) để đảm bảo chất lượng code
├── /app # Chỉ chứa logic điều hướng Expo Router
│ ├── \_layout.tsx # Root Layout (Providers, Fonts, Splash Screen)
│ ├── +not-found.tsx # Xử lý lỗi 404
│ ├── (auth) # Route Group: Các màn hình xác thực (Login, Register)
│ │ ├── \_layout.tsx # Cấu hình Stack cho Auth (headerShown: false)
│ │ ├── sign-in.tsx # Màn hình Đăng nhập
│ │ └── sign-up.tsx # Màn hình Đăng ký
│ └── (tabs) # Route Group: Các màn hình chính (Protected Routes)
│ ├── \_layout.tsx # Cấu hình Bottom Tab Bar
│ ├── index.tsx # Tab Trang chủ
│ ├── explore.tsx # Tab Khám phá
│ └── profile.tsx # Tab Cá nhân
├── /assets # Tài sản tĩnh (Fonts, Images, Icons)
├── /src # Trái tim của ứng dụng
│ ├── components # Các thành phần giao diện tái sử dụng
│ │ ├── ui # Atomic Components (Button, Input, Text, Card) - NativeWind
│ │ └── shared # Molecule Components (ProductCard, UserAvatar)
│ ├── constants # Các hằng số toàn cục (Colors, Layout, API Endpoints)
│ ├── features # Tổ chức theo tính năng (Feature-based)
│ │ ├── auth # Tính năng Xác thực
│ │ │ ├── api # Các gọi API liên quan đến Auth
│ │ │ ├── components # Components chỉ dùng cho Auth (LoginForm)
│ │ │ ├── hooks # Hooks logic (useAuth, useLogin)
│ │ │ ├── store # Zustand Store cho Auth
│ │ │ └── types.ts # Type definitions cho Auth
│ │ └── products # Tính năng Sản phẩm (cấu trúc tương tự)
│ ├── hooks # Global Hooks (useTheme, useDebounce, useAppState)
│ ├── lib # Cấu hình thư viện bên thứ 3 (Axios instance, QueryClient)
│ ├── services # Các dịch vụ hạ tầng (Storage, Analytics, Logger)
│ ├── theme # Cấu hình Theme, Design Tokens
│ ├── types # Global TypeScript Interfaces/Types
│ └── utils # Các hàm tiện ích thuần túy (formatDate, currency)
├── /scripts # Scripts tự động hóa (reset-project, generate-component)
├── app.json # Cấu hình Expo (Prebuild, Permissions, Config Plugins)
├── babel.config.js # Cấu hình Babel (NativeWind preset)
├── global.css # CSS Global cho NativeWind
├── metro.config.js # Cấu hình Metro Bundler (CSS Interop)
├── package.json # Quản lý dependencies
├── tailwind.config.js # Cấu hình Tailwind CSS
└── tsconfig.json # Cấu hình TypeScript (Path Aliases)
2.2 Phân tích Chi tiết Các Quyết định Thiết kế
2.2.1 Tại sao phải tách biệt /app và /src?
Thư mục /app trong Expo Router có vai trò đặc biệt: nó tạo ra các URL routes. Nếu bạn để logic nghiệp vụ (business logic) hoặc các component tái sử dụng bên trong /app, bạn vô tình tạo ra các route "rác" không mong muốn hoặc làm rối loạn bộ định tuyến. Việc di chuyển logic sang /src giúp:
Cách ly (Isolation): Logic nghiệp vụ độc lập với logic điều hướng. Bạn có thể thay đổi thư viện điều hướng trong tương lai (dù khó xảy ra) mà không cần viết lại logic nghiệp vụ.
Tổ chức (Organization): Dễ dàng áp dụng Path Aliases (ví dụ: @/components) trỏ về /src, tạo ra các đường dẫn import sạch sẽ.14
Bảo mật: Đảm bảo các file không phải là màn hình (như file test, utils) không bao giờ vô tình bị expose dưới dạng route.
2.2.2 Chiến lược Feature-First (Slice Architecture)
Thay vì gom nhóm theo loại file (tất cả controllers ở một nơi, tất cả views ở một nơi), chúng ta gom nhóm theo Tính năng (src/features/auth, src/features/cart).
Lợi ích: Khi cần sửa tính năng Auth, lập trình viên chỉ cần tập trung vào một thư mục duy nhất. Nó hỗ trợ khả năng mở rộng (scalability) khi team phát triển lớn lên, giảm thiểu xung đột merge code.16
Encapsulation: Các module bên ngoài chỉ nên import từ index.ts của feature đó, giữ cho chi tiết triển khai bên trong được ẩn giấu (private).
2.2.3 Route Groups (auth) và (tabs)
Sử dụng dấu ngoặc đơn () trong tên thư mục /app/(auth) cho phép nhóm các màn hình lại với nhau về mặt logic và layout mà không làm ảnh hưởng đến đường dẫn URL (ví dụ: URL vẫn là /sign-in thay vì /auth/sign-in). Đây là kỹ thuật quan trọng để phân tách các luồng người dùng (Authenticated vs. Unauthenticated).17
Chương 3: Thiết Lập Môi Trường và Cấu Hình Tooling Chuẩn Mực
Một dự án mẫu tốt phải có nền móng vững chắc về tooling để cưỡng chế (enforce) các quy chuẩn code ngay từ đầu.
3.1 Cấu hình TypeScript và Path Aliases
Việc sử dụng đường dẫn tương đối dài (e.g., ../../../../components/Button) là dấu hiệu của một kiến trúc tồi ("dot-dot-slash hell"). Chúng ta giải quyết vấn đề này bằng Path Aliases trong tsconfig.json.
File: tsconfig.json

JSON

{
"extends": "expo/tsconfig.base",
"compilerOptions": {
"strict": true,
"baseUrl": ".",
"paths": {
"@/_": ["src/_"],
"@components/_": ["src/components/_"],
"@features/_": ["src/features/_"],
"@hooks/_": ["src/hooks/_"],
"@utils/_": ["src/utils/_"],
"@assets/_": ["assets/_"]
}
},
"include": ["**/*.ts", "**/*.tsx", ".eslintrc.js", "nativewind-env.d.ts"]
}

Insight: Cấu hình strict: true là bắt buộc. Trong năm 2025, việc code TypeScript lỏng lẻo (dùng any) là không thể chấp nhận được trong môi trường doanh nghiệp.15
3.2 Chất lượng Code: ESLint và Prettier
Sử dụng eslint-config-expo để đảm bảo tương thích tốt nhất với Hermes Engine và React Native.
File: .eslintrc.js

JavaScript

// https://docs.expo.dev/guides/using-eslint/
module.exports = {
extends: ['expo', 'prettier'],
plugins: ['prettier', 'import'],
rules: {
'prettier/prettier': 'error',
// Cưỡng chế thứ tự import: React -> Library -> Internal -> Relative
'import/order': [
'error',
{
groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
'newlines-between': 'always',
alphabetize: { order: 'asc', caseInsensitive: true },
},
],
},
};

Sự kết hợp này đảm bảo code không chỉ chạy đúng mà còn được định dạng nhất quán giữa các thành viên trong team.20
3.3 Cấu hình NativeWind v4 (Tailwind CSS)
NativeWind v4 mang lại hiệu năng vượt trội nhờ việc biên dịch CSS sang Native Styles tại thời điểm build. Tuy nhiên, cấu hình của nó phức tạp hơn v2.
File: tailwind.config.js

JavaScript

/** @type {import('tailwindcss').Config} \*/
module.exports = {
// QUAN TRỌNG: Phải trỏ đúng đến cả thư mục app và src
content: ["./app/**/_.{js,jsx,ts,tsx}", "./src/\*\*/_.{js,jsx,ts,tsx}"],
presets: [require("nativewind/preset")],
theme: {
extend: {
colors: {
primary: {
DEFAULT: '#007AFF',
foreground: '#FFFFFF',
},
background: '#F2F2F7',
surface: '#FFFFFF',
},
fontFamily: {
// Cấu hình font tùy chỉnh nếu cần
sans:,
bold:,
}
},
},
plugins:,
}

File: babel.config.js
Insight: Nếu thiếu jsxImportSource: "nativewind", các class Tailwind sẽ không được áp dụng vì JSX compiler không biết cách xử lý prop className.21

JavaScript

module.exports = function (api) {
api.cache(true);
return {
presets:,
"nativewind/babel",
],
};
};

File: metro.config.js
Chúng ta cần wrap config mặc định của Expo với withNativeWind để xử lý việc import file CSS.

JavaScript

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(\_\_dirname);

module.exports = withNativeWind(config, { input: "./global.css" });

Chương 4: Triển Khai Hệ Thống Điều Hướng và Luồng Xác Thực (Authentication Flow)
Một trong những thách thức lớn nhất của React Native là quản lý luồng người dùng: Splash Screen -> Kiểm tra đăng nhập -> Điều hướng vào App hoặc Login. Expo Router v4 đơn giản hóa quy trình này nhưng đòi hỏi một kiến trúc Layout chặt chẽ.
4.1 Root Layout (app/\_layout.tsx): Người Nhạc trưởng
Root Layout đóng vai trò khởi tạo toàn bộ ứng dụng: tải Fonts, kết nối Theme, kiểm tra trạng thái Auth, và quản lý Splash Screen.
Mẫu Code Hợp lý cho app/\_layout.tsx:

TypeScript

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, Segments } from 'expo-router';
import \* as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css'; // Import global CSS cho NativeWind

import { useAuthStore } from '@/features/auth/store';
import { useColorScheme } from '@/hooks/useColorScheme';

// Ngăn Splash Screen tự động ẩn cho đến khi App sẵn sàng
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
const colorScheme = useColorScheme();
const router = useRouter();

// 1. Load Fonts và Assets
const [fontsLoaded] = useFonts({
SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
});

// 2. Lấy trạng thái từ Zustand Store
const { isAuthenticated, isHydrated, hydrate } = useAuthStore();

// 3. Khôi phục trạng thái đăng nhập (từ MMKV) khi khởi động
useEffect(() => {
hydrate();
},);

// 4. Xử lý ẩn Splash Screen
useEffect(() => {
if (fontsLoaded && isHydrated) {
SplashScreen.hideAsync();
}
}, [fontsLoaded, isHydrated]);

// 5. Render
if (!fontsLoaded ||!isHydrated) {
return null; // Giữ Splash Screen hiển thị
}

return (
<ThemeProvider value={colorScheme === 'dark'? DarkTheme : DefaultTheme}>
<Stack screenOptions={{ headerShown: false }}>
<Stack.Screen name="(tabs)" />
<Stack.Screen name="(auth)" />
<Stack.Screen name="+not-found" />
</Stack>
</ThemeProvider>
);
}

4.2 Bảo vệ Tuyến đường (Protected Routes)
Thay vì kiểm tra điều kiện if/else phức tạp tại Root, chúng ta sử dụng cơ chế Layout Guard trong từng nhóm route. Đây là cách tiếp cận sạch sẽ nhất, tận dụng khả năng của Expo Router.
File: app/(tabs)/\_layout.tsx (Bảo vệ các màn hình chính)

TypeScript

import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';
import { TabBarIcon } from '@/components/ui/TabBarIcon';

export default function TabLayout() {
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// LOGIC BẢO VỆ: Nếu chưa đăng nhập, đá về trang Login
if (!isAuthenticated) {
return <Redirect href="/(auth)/sign-in" />;
}

return (
<Tabs screenOptions={{ headerShown: false }}>
<Tabs.Screen
name="index"
options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
/>
<Tabs.Screen
name="profile"
options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
/>
</Tabs>
);
}

Insight: Phương pháp này đảm bảo tính đóng gói (encapsulation). Bất kỳ file nào được thêm vào thư mục (tabs) sẽ tự động được bảo vệ mà không cần thêm logic ở nơi khác.23
File: app/(auth)/\_layout.tsx (Ngăn người dùng đã đăng nhập quay lại Login)

TypeScript

import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';

export default function AuthLayout() {
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// Nếu đã đăng nhập, không cho phép truy cập trang Login/Register
if (isAuthenticated) {
return <Redirect href="/(tabs)" />;
}

return (
<Stack screenOptions={{ headerShown: false }}>
<Stack.Screen name="sign-in" />
<Stack.Screen name="sign-up" />
</Stack>
);
}

Chương 5: Quản Lý Trạng Thái (State Management) Hiện Đại
Năm 2025 đánh dấu sự suy thoái của Redux trong các ứng dụng vừa và nhỏ, nhường chỗ cho Zustand (cho Client State) và TanStack Query (cho Server State).
5.1 Thiết kế Zustand Store cho Authentication
Authentication Store cần lưu trữ Token, Thông tin User, và trạng thái tải. Đặc biệt, nó cần tích hợp với MMKV để lưu trữ bền vững (persistence) hiệu năng cao.
File: src/features/auth/store.ts

TypeScript

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// Tạo adapter cho MMKV để tương thích với Zustand middleware
const storage = new MMKV();
const zustandStorage = {
setItem: (name: string, value: string) => storage.set(name, value),
getItem: (name: string) => storage.getString(name)?? null,
removeItem: (name: string) => storage.delete(name),
};

interface User {
id: string;
email: string;
name: string;
}

interface AuthState {
user: User | null;
token: string | null;
isAuthenticated: boolean;
isHydrated: boolean; // Cờ báo hiệu đã load xong từ Storage
signIn: (token: string, user: User) => void;
signOut: () => void;
hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
persist(
(set) => ({
user: null,
token: null,
isAuthenticated: false,
isHydrated: false,

      signIn: (token, user) => {
        set({ token, user, isAuthenticated: true });
        // Có thể trigger thêm các logic phụ tại đây
      },
      signOut: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // Xóa sạch storage nếu cần
      },
      hydrate: () => {
        // Hàm này được gọi ở RootLayout để đánh dấu là đã sẵn sàng
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        return () => state?.hydrate();
      },
    }

)
);

Insight: Việc sử dụng cờ isHydrated là kỹ thuật quan trọng để tránh "Flicker Effect" (hiện tượng màn hình nháy từ Login sang Home) khi ứng dụng khởi động. Root Layout sẽ đợi cờ này bật lên mới ẩn Splash Screen.24
5.2 Server State với TanStack Query
Không bao giờ lưu dữ liệu API (như danh sách sản phẩm) vào Zustand Store. Hãy dùng TanStack Query để tận dụng khả năng caching, refetching on focus, và optimistic updates.
File: src/lib/query-client.ts

TypeScript

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
defaultOptions: {
queries: {
retry: 2,
staleTime: 1000 _ 60, // Dữ liệu được coi là mới trong 1 phút
gcTime: 1000 _ 60 \* 5, // Garbage collection sau 5 phút
},
},
});

Tích hợp QueryClientProvider vào app/\_layout.tsx bao quanh Stack.
Chương 6: Chiến Lược UI/UX và Atomic Design với NativeWind
Để đạt được thiết kế hợp lý, UI phải nhất quán và dễ bảo trì. Chúng ta sử dụng NativeWind để xây dựng các "Atomic Components" (Thành phần nguyên tử) trong thư mục src/components/ui.
6.1 Xây dựng Component Tái sử dụng (Reusable Components)
Thay vì viết className="bg-blue-500 p-4 rounded-lg..." lặp đi lặp lại, hãy đóng gói chúng.
Ví dụ: Button Component (src/components/ui/Button.tsx)

TypeScript

import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { clsx } from 'clsx'; // Thư viện tiện ích để nối class

interface ButtonProps extends TouchableOpacityProps {
variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
size?: 'sm' | 'md' | 'lg';
label: string;
isLoading?: boolean;
}

export function Button({
variant = 'primary',
size = 'md',
label,
isLoading,
className,
disabled,
...props
}: ButtonProps) {

// Định nghĩa các biến thể style
const baseStyle = "flex-row items-center justify-center rounded-xl";
const variants = {
primary: "bg-primary active:bg-primary/90",
secondary: "bg-gray-100 active:bg-gray-200 dark:bg-gray-800",
outline: "border border-gray-300 bg-transparent dark:border-gray-700",
ghost: "bg-transparent hover:bg-gray-50",
};

const sizes = {
sm: "px-3 py-2",
md: "px-4 py-3",
lg: "px-6 py-4",
};

const textStyles = clsx("font-semibold text-center", {
"text-white": variant === 'primary',
"text-gray-900 dark:text-white": variant!== 'primary',
"text-sm": size === 'sm',
"text-base": size === 'md',
"text-lg": size === 'lg',
});

return (
<TouchableOpacity
className={clsx(baseStyle, variants[variant], sizes[size], className, {
"opacity-50": disabled |

| isLoading
})}
disabled={disabled |

| isLoading}
{...props} >
{isLoading && <ActivityIndicator color={variant === 'primary'? 'white' : 'gray'} className="mr-2" />}
<Text className={textStyles}>{label}</Text>
</TouchableOpacity>
);
}

Insight: Sử dụng clsx giúp quản lý logic conditional styles (style có điều kiện) một cách rõ ràng. Việc expose prop className cho phép ghi đè style khi cần thiết nhưng vẫn giữ được cấu trúc mặc định.6
6.2 Theming và Dark Mode
NativeWind hỗ trợ Dark Mode tự động dựa trên class dark:. Kết hợp với useColorScheme của React Native, chúng ta có thể tạo ra ứng dụng thích ứng giao diện ngay lập tức. Cần đảm bảo global.css đã định nghĩa các biến màu CSS (CSS Variables) để dễ dàng thay đổi theme toàn cục.
File: global.css

CSS

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
:root {
--color-primary: 0 122 255;
--color-background: 242 242 247;
}
.dark {
--color-primary: 10 132 255;
--color-background: 0 0 0;
}
}

Chương 7: Lớp Dữ Liệu và Kiến Trúc API
Để đảm bảo khả năng mở rộng, không bao giờ gọi axios.get() trực tiếp trong Component. Hãy sử dụng mẫu thiết kế Repository hoặc Service Layer.
7.1 Cấu hình Axios Interceptor
Xử lý việc đính kèm Token tự động và Refresh Token khi hết hạn.
File: src/lib/axios.ts

TypeScript

import axios from 'axios';
import { useAuthStore } from '@/features/auth/store';

const apiClient = axios.create({
baseURL: process.env.EXPO_PUBLIC_API_URL, // Biến môi trường trong Expo
headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
// Lấy token từ Zustand Store (phiên bản non-hook để dùng trong JS thường)
const token = useAuthStore.getState().token;
if (token) {
config.headers.Authorization = `Bearer ${token}`;
}
return config;
});

// Xử lý lỗi 401 (Unauthorized) để logout tự động
apiClient.interceptors.response.use(
(response) => response,
(error) => {
if (error.response?.status === 401) {
useAuthStore.getState().signOut();
}
return Promise.reject(error);
}
);

export default apiClient;

7.2 Auth API Service
Đóng gói các gọi mạng trong thư mục features/auth/api.
File: src/features/auth/api/index.ts

TypeScript

import apiClient from '@/lib/axios';
import { LoginCredentials, AuthResponse } from '../types';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
const { data } = await apiClient.post('/auth/login', credentials);
return data;
};

export const registerUser = async (userData: any) => {
const { data } = await apiClient.post('/auth/register', userData);
return data;
};

Kết hợp với TanStack Query trong Custom Hooks:
File: src/features/auth/hooks/useLogin.ts

TypeScript

import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../api';
import { useAuthStore } from '../store';
import { useRouter } from 'expo-router';

export const useLogin = () => {
const signIn = useAuthStore((state) => state.signIn);
const router = useRouter();

return useMutation({
mutationFn: loginUser,
onSuccess: (data) => {
signIn(data.token, data.user);
router.replace('/(tabs)');
},
onError: (error) => {
// Xử lý hiển thị lỗi (Toast, Alert)
console.error(error);
}
});
};

Chương 8: Kết Luận và Các Bước Tiếp Theo
Bản thiết kế này đáp ứng đầy đủ yêu cầu về một "Expo Project Template" hợp lý cho năm 2025. Nó không chỉ cung cấp một bộ khung (boilerplate) mà còn định hình một triết lý phát triển:
Tính kỷ luật: Phân tách rõ ràng giữa app (Routing) và src (Business Logic).
Tính hiện đại: Sử dụng Expo SDK 52, Router v4, và NativeWind v4 để tận dụng tối đa hiệu năng của New Architecture.
Tính mở rộng: Cấu trúc Feature-based cho phép team scale lên 10-20 người mà không dẫm chân lên nhau.
Trải nghiệm phát triển: Tích hợp sẵn TypeScript, ESLint, Prettier và Path Aliases giúp tăng tốc độ code và giảm lỗi.
Khuyến nghị Triển khai:
Khởi tạo dự án bằng lệnh: npx create-expo-app@latest my-app --template tabs để có sẵn cấu trúc cơ bản của Expo Router.
Cài đặt NativeWind và cấu hình Babel/Tailwind theo hướng dẫn ở Chương 3.
Thiết lập cấu trúc thư mục src và di chuyển logic ra khỏi app.
Tích hợp Zustand và TanStack Query.
Xây dựng thư viện UI Components cơ bản (Button, Input, Text).
Đây là nền tảng vững chắc để xây dựng các ứng dụng React Native cấp độ doanh nghiệp (Enterprise-grade), đảm bảo khả năng bảo trì trong 3-5 năm tới.
Nguồn trích dẫn
React Native's New Architecture - Expo Documentation, truy cập vào tháng 12 19, 2025, https://docs.expo.dev/guides/new-architecture/
infinitered/ignite: Infinite Red's battle-tested React Native project boilerplate, along with a CLI, component/model generators, and more! 9 years of continuous development and counting. - GitHub, truy cập vào tháng 12 19, 2025, https://github.com/infinitered/ignite
Increase your Expo-nent power with Ignite Generators, truy cập vào tháng 12 19, 2025, https://expo.dev/blog/increase-your-expo-power-with-ignite-generators
How to organize Expo app folder structure for clarity and scalability, truy cập vào tháng 12 19, 2025, https://expo.dev/blog/expo-app-folder-structure-best-practices
Expo Router vs React Navigation: A Comprehensive Comparison | Attract Group, truy cập vào tháng 12 19, 2025, https://attractgroup.com/blog/expo-router-vs-react-navigation-a-comprehensive-comparison/
The 10 best React Native UI libraries of 2025 - LogRocket Blog, truy cập vào tháng 12 19, 2025, https://blog.logrocket.com/best-react-native-ui-component-libraries/
Redux Toolkit vs React Query vs Zustand: Which One Should You Use in 2025? - Medium, truy cập vào tháng 12 19, 2025, https://medium.com/@vishalthakur2463/redux-toolkit-vs-react-query-vs-zustand-which-one-should-you-use-in-2025-048c1d3915f4
25 React Native Best Practices for High Performance Apps 2025 - eSparkBiz, truy cập vào tháng 12 19, 2025, https://www.esparkinfo.com/blog/react-native-best-practices
Expo Router vs React Navigation: How They Compare - NativeLaunch, truy cập vào tháng 12 19, 2025, https://nativelaunch.dev/articles/compare/expo-router-vs-react-navigation
React Navigation 7 vs Expo Router: Complete Comparison Guide for 2025 - Viewlytics, truy cập vào tháng 12 19, 2025, https://viewlytics.ai/blog/react-navigation-7-vs-expo-router
Installation - Nativewind, truy cập vào tháng 12 19, 2025, https://www.nativewind.dev/docs/getting-started/installation
Top 5 Libraries Every React Native Dev NEEDS to Know in 2025 | by Davi Camarinha, truy cập vào tháng 12 19, 2025, https://medium.com/@davicamarinha/top-5-libraries-every-react-native-dev-needs-to-know-in-2025-3ae9cde07ef0
State Management Showdown – Redux Toolkit vs Zustand vs React Query, truy cập vào tháng 12 19, 2025, https://dev.to/maurya-sachin/state-management-showdown-redux-toolkit-vs-zustand-vs-react-query-p44
Top-level src directory - Expo Documentation, truy cập vào tháng 12 19, 2025, https://docs.expo.dev/router/reference/src-directory/
Using path aliases for cleaner React and TypeScript imports - LogRocket Blog, truy cập vào tháng 12 19, 2025, https://blog.logrocket.com/using-path-aliases-cleaner-react-typescript-imports/
How to structure a React App in 2025 (SPA, SSR or Native) | by Ramon Prata | Medium, truy cập vào tháng 12 19, 2025, https://ramonprata.medium.com/how-to-structure-a-react-app-in-2025-spa-ssr-or-native-10d8de7a245a
JavaScript tabs - Expo Documentation, truy cập vào tháng 12 19, 2025, https://docs.expo.dev/router/advanced/tabs/
Best Practices for Expo Router: Tabs, Stacks & Shared Screens | by CodeCrafter - Medium, truy cập vào tháng 12 19, 2025, https://medium.com/@siddhantshelake/best-practices-for-expo-router-tabs-stacks-shared-screens-b3cacc3e8ebb
How to Use Path Aliases '@' in React Native with Expo - DEV Community, truy cập vào tháng 12 19, 2025, https://dev.to/cathylai/how-to-use-path-aliases-in-react-native-with-expo-1fl2
Using ESLint and Prettier - Expo Documentation, truy cập vào tháng 12 19, 2025, https://docs.expo.dev/guides/using-eslint/
NativeWind V4 Not working with ReactNative, TypeScript and Expo | by Prajwal H G, truy cập vào tháng 12 19, 2025, https://medium.com/@learnwithgeek/nativewind-v4-not-working-with-reactnative-typescript-and-expo-c3a69644ab74
NativeWind v2/v4 problems with Expo 50 and Expo Router 3 : r/reactnative - Reddit, truy cập vào tháng 12 19, 2025, https://www.reddit.com/r/reactnative/comments/1auo17h/nativewind_v2v4_problems_with_expo_50_and_expo/
Expo Router Authentication with Protected Routes & Persistent Login - Medium, truy cập vào tháng 12 19, 2025, https://medium.com/@siddhantshelake/expo-router-authentication-with-protected-routes-persistent-login-eed364e310cc
Authentication in Expo Router, truy cập vào tháng 12 19, 2025, https://docs.expo.dev/router/advanced/authentication/
Mastering State Management in React Native with Zustand: A Modern Guide, truy cập vào tháng 12 19, 2025, https://dev.to/james_mugambi_494c7da2b07/mastering-state-management-in-react-native-with-zustand-a-modern-guide-1bfd
Tamagui vs Nativewind - What's best for web/mobile shared components? : r/reactnative, truy cập vào tháng 12 19, 2025, https://www.reddit.com/r/reactnative/comments/1b59ahw/tamagui_vs_nativewind_whats_best_for_webmobile/
