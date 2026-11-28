import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { Collection } from '../data/collections';
import type { City, Spot } from '../data/spots';
import { GlowPress, T, grid, space, useColors } from '../ui';

/** Breite Sammlungs-Karte im Feed: großes Bild links, zwei kleine rechts, Titel darunter. */
export function CollectionCard({ col, items, city }: { col: Collection; items: Spot[]; city: City }) {
  const c = useColors();
  const [a, b, d] = items;
  const title = col.title(city);
  return (
    <View style={st.wrap}>
      <GlowPress rounded={grid.radius} onPress={() => router.push(`/collection/${col.key}`)} accessibilityRole="button"
        accessibilityLabel={`${title}, ${items.length} Spots. Öffnen`}>
        <View style={[st.row, { borderRadius: grid.radius, backgroundColor: c.fill }]}>
          <Image source={a.images[0]} style={st.big} contentFit="cover" />
          <View style={st.side}>
            <Image source={b.images[0]} style={st.small} contentFit="cover" />
            <Image source={d.images[0]} style={st.small} contentFit="cover" />
          </View>
        </View>
      </GlowPress>
      <View style={st.text}>
        <T variant="name" numberOfLines={1}>{title}</T>
        <T variant="small" color="asphalt">{col.subtitle} · {items.length} Spots</T>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { paddingHorizontal: grid.edge, paddingVertical: space.md, gap: space.sm },
  row: { flexDirection: 'row', gap: grid.gap, aspectRatio: 1.6, overflow: 'hidden' },
  big: { flex: 2 },
  side: { flex: 1, gap: grid.gap },
  small: { flex: 1 },
  text: { paddingHorizontal: space.sm, gap: 2 },
});
