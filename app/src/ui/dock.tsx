import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { haptic } from './components';
import { useColors } from './theme';
import { dock } from './tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];
export type DockItem = { name: string; label: string; on: IconName; off: IconName };

/** Tab-Leiste wie bei Pinterest: schwebt unten in der Mitte, jedes Symbol in einem eigenen runden Quadrat. */
export function Dock({ state, navigateToTab, insets, items }: BottomTabBarProps & { items: DockItem[] }) {
  const c = useColors();
  return (
    <View pointerEvents="box-none" style={[st.wrap, { bottom: insets.bottom + dock.bottom }]}>
      {items.map((it) => {
        const route = state.routes.find((r) => r.name === it.name);
        if (!route) return null;
        const focused = state.routes[state.index]?.key === route.key;
        return (
          <Pressable key={it.name} accessibilityRole="tab" accessibilityLabel={it.label} accessibilityState={{ selected: focused }}
            onPress={() => { haptic.select(); navigateToTab(route.key); }}
            style={[st.btn, { backgroundColor: c.dock, shadowColor: c.shadow }]}>
            <Ionicons name={focused ? it.on : it.off} size={26} color={c.onDock} />
          </Pressable>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: dock.gap },
  btn: {
    width: dock.size, height: dock.size, borderRadius: dock.radius, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
});
