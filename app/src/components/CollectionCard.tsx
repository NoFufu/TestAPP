import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { Collection } from '../data/collections';
import type { City, Spot } from '../data/spots';
import { GlowPress, T, collectionCard, collectionTint, grid, radius, space, useColors } from '../ui';

/** Farbfläche mit großer Zahl, Titel und gefächerten Fotos. Gleich im Feed und oben im Sammlungs-Screen. */
export function CollectionBanner({ col, items, city, compact }: { col: Collection; items: Spot[]; city: City; compact?: boolean }) {
  const c = useColors();
  const tint = collectionTint[col.key as keyof typeof collectionTint] ?? c.ink;
  // Hintergrund = Foto des ersten Spots, davor gefächert die nächsten (ist es zu wenig, wiederholt sich nichts)
  const photos = items.slice(1, 4);
  return (
    <View style={[st.banner, { height: compact ? collectionCard.height - space.xl : collectionCard.height }]}>
      <Image source={items[0].images[0]} contentFit="cover" style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`tint-${col.key}`} x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tint} stopOpacity={0.3} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.82} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#tint-${col.key})`} />
      </Svg>
      <View style={st.text}>
        <View style={st.topRow}>
          <T variant="signMeta" color="onPhoto" style={st.top}>TOP</T>
          <T variant="hero" color="onPhoto" style={st.num}>{items.length}</T>
        </View>
        <T variant="sign" color="onPhoto" numberOfLines={2}>{col.title(city)}</T>
        <T variant="small" color="onPhoto" numberOfLines={1} style={{ opacity: 0.85 }}>{col.subtitle}</T>
      </View>
      <View style={st.fan} pointerEvents="none">
        {photos.map((p, i) => (
          <Image key={p.id} source={p.images[0]} contentFit="cover"
            style={[st.photo, { borderColor: c.onPhoto, shadowColor: c.shadow, transform: [{ rotate: `${(i - 1) * collectionCard.tilt}deg` }], marginLeft: i ? -collectionCard.photoW * 0.55 : 0, zIndex: i }]} />
        ))}
      </View>
    </View>
  );
}

/** Sammlungs-Karte im Feed: deutlich anders als die Foto-Kacheln. */
export function CollectionCard({ col, items, city }: { col: Collection; items: Spot[]; city: City }) {
  return (
    <View style={st.wrap}>
      <GlowPress rounded={radius.card} onPress={() => router.push(`/collection/${col.key}`)} accessibilityRole="button"
        accessibilityLabel={`${col.title(city)}, ${items.length} Spots. Öffnen`}>
        <CollectionBanner col={col} items={items} city={city} />
      </GlowPress>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { paddingHorizontal: grid.edge, paddingVertical: space.md },
  banner: { borderRadius: radius.card, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.18)', flexDirection: 'row', alignItems: 'center', padding: space.lg, gap: space.sm },
  text: { flex: 1, gap: space.xs },
  topRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  top: { letterSpacing: 2, paddingBottom: space.sm },
  num: { includeFontPadding: false },
  fan: { flexDirection: 'row', alignItems: 'center', paddingRight: space.sm },
  photo: { width: collectionCard.photoW, height: collectionCard.photoH, borderRadius: radius.thumb, borderWidth: 2, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
