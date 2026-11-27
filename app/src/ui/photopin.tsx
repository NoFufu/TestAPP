import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { useColors } from './theme';

/** Runde Foto-Markierung für Karten: Foto im Kreis, Kategorie-Punkt, kleine Spitze. */
export function PhotoPin({ photo, dot, active }: { photo: ImageSourcePropType; dot: string; active?: boolean }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[st.pin, { borderColor: active ? c.ink : c.surface, shadowColor: c.shadow }, active && st.pinActive]}>
        <Image source={photo} style={st.pinImg} />
        <View style={[st.pinDot, { backgroundColor: dot, borderColor: c.surface }]} />
      </View>
      <View style={[st.pinTip, { borderTopColor: active ? c.ink : c.surface }]} />
    </View>
  );
}

const st = StyleSheet.create({
  pin: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, overflow: 'hidden', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  pinActive: { width: 46, height: 46, borderRadius: 23, borderWidth: 3 },
  pinImg: { width: '100%', height: '100%' },
  pinDot: { position: 'absolute', right: 0, bottom: 0, width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.5 },
  pinTip: { width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
});
