/**
 * Tabs Layout (Expo Router)
 * FSD Pattern: Proxy Pattern
 */

import { useColorScheme } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { TabBarIcon } from '@/shared/ui';
import { useSessionStore } from '@/entities/session';

export default function TabLayout() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const colorScheme = useColorScheme() ?? 'light';

  const activeColor = colorScheme === 'dark' ? '#0a84ff' : '#007aff';
  const inactiveColor = colorScheme === 'dark' ? '#8e8e93' : '#8e8e93';

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="demo"
        options={{
          title: 'Demo',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
    </Tabs>
  );
}
