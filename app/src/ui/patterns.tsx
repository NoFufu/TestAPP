import { Image, type ImageSource } from 'expo-image';
import type React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { IconButton, T, haptic } from './components';
import { useColors } from './theme';
import { radius, space } from './tokens';

/* ---------- Masonry ---------- */
export type Pin = {
  key: string;
  photo: ImageSource | number;
  /** Höhe / Breite der Kachel, z. B. 1.25 für 4:5 */
  ratio: number;
  title?: string;
  subtitle?: string;
  label: string; // Screenreader
  saved?: boolean;
  onPress: () => void;
  onSave?: () => void;
};
/** Zweispaltiges Raster mit unterschiedlich hohen Kacheln. Verteilt Kacheln immer auf die kürzere Spalte. */
export function Masonry({ pins, header }: { pins: Pin[]; header?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const gap = space.sm;
  const colW = (width - gap * 3) / 2;
  const cols: Pin[][] = [[], []];
  const h = [0, 0];
  for (const p of pins) {
    const i = h[0] <= h[1] ? 0 : 1;
    cols[i].push(p);
    h[i] += colW * p.ratio + (p.title ? 44 : 0) + gap;
  }
  return (
    <View>
      {header}
      <View style={{ flexDirection: 'row', gap, paddingHorizontal: gap }}>
        {cols.map((col, ci) => (
          <View key={ci} style={{ width: colW, gap }}>
            {col.map((p) => <PinTile key={p.key} pin={p} width={colW} />)}
          </View>
        ))}
      </View>
    </View>
  );
}

function PinTile({ pin, width }: { pin: Pin; width: number }) {
  const c = useColors();
  return (
    <View>
      <Pressable onPress={pin.onPress} accessibilityRole="button" accessibilityLabel={pin.label}>
        <Image source={pin.photo} style={{ width, height: width * pin.ratio, borderRadius: radius.card - 4, backgroundColor: c.fill }}
          contentFit="cover" transition={150} />
      </Pressable>
      {pin.title ? (
        <View style={st.pinText}>
          <View style={{ flex: 1 }}>
            <T variant="label" numberOfLines={1}>{pin.title}</T>
            {pin.subtitle ? <T variant="small" color="asphalt" numberOfLines={1}>{pin.subtitle}</T> : null}
          </View>
          {pin.onSave ? (
            <IconButton icon={pin.saved ? 'bookmark' : 'bookmark-outline'} size={20}
              label={pin.saved ? `${pin.title} aus Merkliste entfernen` : `${pin.title} merken`}
              color={pin.saved ? c.cherry : c.ink}
              onPress={() => { haptic.select(); pin.onSave?.(); }} style={{ minWidth: 36, minHeight: 40 }} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Abwechslungsreiche Kachelhöhen, aber stabil je Foto. */
export function pinRatio(seed: number): number {
  const r = [1.25, 1.5, 1.0, 1.33, 1.6, 1.15];
  return r[Math.abs(seed * 7 + 3) % r.length];
}

/* ---------- PhotoGrid ---------- */
export type GridItem = { key: string; photo: ImageSource | number; label: string; onPress: () => void };
/** Raster für Profil (3 Spalten, quadratisch) oder Entdecken (Mosaik: 1 groß + 2 klein). */
export function PhotoGrid({ items, layout = 'square' }: { items: GridItem[]; layout?: 'square' | 'mosaic' }) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const gap = 2;
  const cell = (width - gap * 2) / 3;

  if (layout === 'square') {
    return (
      <View style={[st.wrap, { gap }]}>
        {items.map((it) => (
          <Pressable key={it.key} onPress={it.onPress} accessibilityRole="button" accessibilityLabel={it.label}>
            <Image source={it.photo} style={{ width: cell, height: cell, backgroundColor: c.fill }} contentFit="cover" />
          </Pressable>
        ))}
      </View>
    );
  }
  // Mosaik in Dreiergruppen, großes Bild abwechselnd links/rechts
  const groups: GridItem[][] = [];
  for (let i = 0; i < items.length; i += 3) groups.push(items.slice(i, i + 3));
  return (
    <View style={{ gap }}>
      {groups.map((g, gi) => {
        const [big, ...small] = g;
        const Big = (
          <Pressable key={big.key} onPress={big.onPress} accessibilityRole="button" accessibilityLabel={big.label}>
            <Image source={big.photo} style={{ width: cell * 2 + gap, height: cell * 2 + gap, backgroundColor: c.fill }} contentFit="cover" />
          </Pressable>
        );
        const Small = (
          <View key="s" style={{ gap }}>
            {small.map((it) => (
              <Pressable key={it.key} onPress={it.onPress} accessibilityRole="button" accessibilityLabel={it.label}>
                <Image source={it.photo} style={{ width: cell, height: cell, backgroundColor: c.fill }} contentFit="cover" />
              </Pressable>
            ))}
          </View>
        );
        return <View key={gi} style={{ flexDirection: 'row', gap }}>{gi % 2 ? [Small, Big] : [Big, Small]}</View>;
      })}
    </View>
  );
}

const st = StyleSheet.create({
  pinText: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.xs, paddingTop: space.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
