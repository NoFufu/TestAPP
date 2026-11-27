import { Tabs } from 'expo-router/js-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useTheme } from '../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name={name} color={color as string} size={size} />
);

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Karte', tabBarIcon: icon('map-outline') }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed', tabBarIcon: icon('albums-outline') }} />
      <Tabs.Screen name="upload" options={{ title: 'Hochladen', tabBarIcon: icon('add-circle-outline') }} />
      <Tabs.Screen name="saved" options={{ title: 'Gemerkt', tabBarIcon: icon('bookmark-outline') }} />
    </Tabs>
  );
}
