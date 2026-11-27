import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useColors } from '../../src/ui';

type IconName = ComponentProps<typeof Ionicons>['name'];
/** Tab-Leiste nur mit Symbolen: aktiv = gefüllt. */
const icon = (on: IconName, off: IconName) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? on : off} color={color as string} size={26} />
  );

export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: c.ink,
        tabBarInactiveTintColor: c.ink,
        tabBarStyle: { backgroundColor: c.paper, borderTopColor: c.line },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarAccessibilityLabel: 'Home', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="explore" options={{ title: 'Entdecken', tabBarAccessibilityLabel: 'Entdecken', tabBarIcon: icon('search', 'search-outline') }} />
      <Tabs.Screen name="upload" options={{ title: 'Hochladen', tabBarAccessibilityLabel: 'Hochladen', tabBarIcon: icon('add-circle', 'add-circle-outline') }} />
      <Tabs.Screen name="shoots" options={{ title: 'Shoots', tabBarAccessibilityLabel: 'Gemerkte Spots', tabBarIcon: icon('bookmark', 'bookmark-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarAccessibilityLabel: 'Profil', tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
