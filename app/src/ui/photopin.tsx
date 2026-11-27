import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { useColors } from './theme';

type McIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Runde Foto-Markierung für Karten: Foto im Kreis, Kategorie-Symbol unten rechts, kleine Spitze. */
export function PhotoPin({ photo, dot, icon, active }: { photo: ImageSourcePropType; dot: string; icon?: McIcon; active?: boolean }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[st.pin, { borderColor: active ? c.ink : c.surface, shadowColor: c.shadow }, active && st.pinActive]}>
        <Image source={photo} style={st.pinImg} />
      </View>
      <View style={[st.badge, { backgroundColor: dot, borderColor: c.surface }, active && st.badgeActive]}>
        {icon ? <MaterialCommunityIcons name={icon} size={active ? 12 : 10} color={c.onPhoto} /> : null}
      </View>
      <View style={[st.pinTip, { borderTopColor: active ? c.ink : c.surface }]} />
    </View>
  );
}

const st = StyleSheet.create({
  pin: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, overflow: 'hidden', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  pinActive: { width: 46, height: 46, borderRadius: 23, borderWidth: 3 },
  pinImg: { width: '100%', height: '100%' },
  badge: { position: 'absolute', right: -4, top: 18, width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  badgeActive: { top: 30, width: 20, height: 20, borderRadius: 10, right: -5 },
  pinTip: { width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
});
