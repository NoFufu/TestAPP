import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { haptic } from './components';
import { useColors } from './theme';
import { dock, space } from './tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];
export type DockItem = { name: string; label: string; on: IconName; off: IconName };

/** Tab-Leiste wie bei Pinterest: schwebt unten in der Mitte, jedes Symbol in einem eigenen runden Quadrat. */
export function Dock({ state, navigateToTab, insets, items }: BottomTabBarProps & { items: DockItem[] }) {
  const c = useColors();
  // Auf der Karte (Entdecken) kein Verlauf, die Karte läuft randlos bis unten.
  const onMap = state.routes[state.index]?.name === 'explore';
  return (
    <>
      {/* Weicher Verlauf in Hintergrundfarbe: Text hinter der Leiste wird ausgeblendet statt zerschnitten */}
      {onMap ? null : <View pointerEvents="none" style={[st.fade, { height: dock.fade + insets.bottom }]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="dockFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c.paper} stopOpacity={0} />
              <Stop offset="0.65" stopColor={c.paper} stopOpacity={0.9} />
              <Stop offset="1" stopColor={c.paper} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#dockFade)" />
        </Svg>
      </View>}
    <View pointerEvents="box-none" style={[st.wrap, { bottom: Math.max(insets.bottom + dock.bottom, space.sm) }]}>
      {items.map((it) => {
        const route = state.routes.find((r) => r.name === it.name);
        if (!route) return null;
        const focused = state.routes[state.index]?.key === route.key;
        return (
          <Pressable key={it.name} accessibilityRole="tab" accessibilityLabel={it.label} accessibilityState={{ selected: focused }}
            onPress={() => { haptic.select(); navigateToTab(route.key); }}
            style={[st.btn, { backgroundColor: focused ? c.dockActive : c.dock, shadowColor: c.shadow }]}>
            <Ionicons name={focused ? it.on : it.off} size={26} color={c.onDock} />
          </Pressable>
        );
      })}
    </View>
    </>
  );
}

const st = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  wrap: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: dock.gap },
  btn: {
    width: dock.size, height: dock.size, borderRadius: dock.radius, alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
});
