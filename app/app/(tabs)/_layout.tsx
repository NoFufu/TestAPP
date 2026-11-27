import { Tabs } from 'expo-router/js-tabs';
import { Text, type ColorValue } from 'react-native';
import { useTheme } from '../../src/theme';

const icon = (glyph: string) => ({ color }: { color: ColorValue }) => (
  <Text style={{ color, fontSize: 20, lineHeight: 22 }}>{glyph}</Text>
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
      <Tabs.Screen name="index" options={{ title: 'Karte', tabBarIcon: icon('◎') }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed', tabBarIcon: icon('▤') }} />
      <Tabs.Screen name="upload" options={{ title: 'Hochladen', tabBarIcon: icon('＋') }} />
      <Tabs.Screen name="saved" options={{ title: 'Gemerkt', tabBarIcon: icon('♥') }} />
    </Tabs>
  );
}
