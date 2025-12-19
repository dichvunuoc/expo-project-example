import 'react-native-gesture-handler/jestSetup';

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (component: unknown) => component,
  useColorScheme: jest.fn(),
  getColorScheme: jest.fn(),
  TwProvider: 'View',
  css: jest.fn(() => ({})),
  tw: jest.fn(() => ({})),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = jest.requireMock('react-native-reanimated/mock');
  (Reanimated.default as any).call = () => {};
  return Reanimated;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: any }) => children,
    SafeAreaConsumer: ({ children }: { children: any }) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `myapp:///${path}`),
  openURL: jest.fn(() => Promise.resolve()),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve()),
  dismissBrowser: jest.fn(() => Promise.resolve()),
  maybeCompleteAuthSession: jest.fn(() => Promise.resolve()),
  warmUpAsync: jest.fn(() => Promise.resolve()),
  coolDownAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(() => true),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    remove: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
    canGoBack: jest.fn(() => false),
  })),
  useSegments: jest.fn(() => []),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn((cb) => cb()),
  useIsFocused: jest.fn(() => true),
  Link: 'Link',
  Redirect: 'Redirect',
  Slot: 'Slot',
  Stack: 'Stack',
  Tabs: 'Tabs',
  Drawer: 'Drawer',
}));

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(({ mutationFn, onSuccess, onError }) => ({
    mutate: jest.fn((variables) => {
      mutationFn(variables)
        .then((result: any) => onSuccess && onSuccess(result))
        .catch((error: any) => onError && onError(error));
    }),
    mutateAsync: jest.fn(mutationFn),
    isLoading: false,
    isError: false,
    error: null,
    data: null,
    reset: jest.fn(),
  })),
  useQuery: jest.fn(({ queryFn }) => ({
    data: queryFn ? null : undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: any }) => children,
}));

// Global test timeout
jest.setTimeout(10000);
