import { Image, type ImageSource } from 'expo-image';
import type React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GlowPress, T, haptic } from './components';
import { useColors } from './theme';
import { grid, radius, space } from './tokens';

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
  /** Kleines Fähnchen unter der Kachel: Foto melden */
  onReport?: () => void;
};
/** Zweispaltiges Raster mit unterschiedlich hohen Kacheln. Verteilt Kacheln immer auf die kürzere Spalte. */
export function Masonry({ pins, header }: { pins: Pin[]; header?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const gap = grid.gap;
  const colW = (width - grid.edge * 2 - gap) / 2;
  const cols: Pin[][] = [[], []];
  const h = [0, 0];
  for (const p of pins) {
    const i = h[0] <= h[1] ? 0 : 1;
    cols[i].push(p);
    h[i] += colW * p.ratio + (p.title || p.onSave ? grid.footer : gap);
  }
  return (
    <View>
      {header}
      <View style={{ flexDirection: 'row', gap, paddingHorizontal: grid.edge }}>
        {cols.map((col, ci) => (
          <View key={ci} style={{ width: colW }}>
            {col.map((p) => <PinTile key={p.key} pin={p} width={colW} />)}
          </View>
        ))}
      </View>
    </View>
  );
}

function PinTile({ pin, width }: { pin: Pin; width: number }) {
  const c = useColors();
  const foot = pin.title || pin.onSave || pin.onReport;
  return (
    <View style={{ marginBottom: foot ? 0 : grid.gap }}>
      <GlowPress rounded={grid.radius} onPress={pin.onPress} accessibilityRole="button" accessibilityLabel={pin.label}>
        <Image source={pin.photo} style={{ width, height: width * pin.ratio, borderRadius: grid.radius, backgroundColor: c.fill }}
          contentFit="cover" transition={150} />
      </GlowPress>
      {foot ? (
        <View style={st.pinText}>
          <T variant="small" color="asphalt" numberOfLines={1} style={{ flex: 1 }}>{pin.title ?? ''}</T>
          {pin.onReport ? (
            <Pressable hitSlop={space.md} accessibilityRole="button" accessibilityLabel="Dieses Foto melden" onPress={pin.onReport}>
              <Ionicons name="flag-outline" size={14} color={c.asphalt} />
            </Pressable>
          ) : null}
          {pin.onSave ? (
            <Pressable hitSlop={space.md} accessibilityRole="button"
              accessibilityLabel={pin.saved ? `${pin.title ?? 'Spot'} aus Merkliste entfernen` : `${pin.title ?? 'Spot'} merken`}
              onPress={() => { haptic.select(); pin.onSave?.(); }}>
              <Ionicons name={pin.saved ? 'bookmark' : 'bookmark-outline'} size={16} color={pin.saved ? c.cherry : c.asphalt} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Abwechslungsreiche Kachelhöhen, aber stabil je Foto. */
export function pinRatio(seed: number): number {
  const r = [1.4, 1.7, 1.2, 1.5, 1.8, 1.3];
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
          <GlowPress rounded={0} key={it.key} onPress={it.onPress} accessibilityRole="button" accessibilityLabel={it.label}>
            <Image source={it.photo} style={{ width: cell, height: cell, backgroundColor: c.fill }} contentFit="cover" />
          </GlowPress>
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
          <GlowPress rounded={0} key={big.key} onPress={big.onPress} accessibilityRole="button" accessibilityLabel={big.label}>
            <Image source={big.photo} style={{ width: cell * 2 + gap, height: cell * 2 + gap, backgroundColor: c.fill }} contentFit="cover" />
          </GlowPress>
        );
        const Small = (
          <View key="s" style={{ gap }}>
            {small.map((it) => (
              <GlowPress rounded={0} key={it.key} onPress={it.onPress} accessibilityRole="button" accessibilityLabel={it.label}>
                <Image source={it.photo} style={{ width: cell, height: cell, backgroundColor: c.fill }} contentFit="cover" />
              </GlowPress>
            ))}
          </View>
        );
        return <View key={gi} style={{ flexDirection: 'row', gap }}>{gi % 2 ? [Small, Big] : [Big, Small]}</View>;
      })}
    </View>
  );
}

const st = StyleSheet.create({
  pinText: { flexDirection: 'row', alignItems: 'center', height: grid.footer, paddingHorizontal: space.xs, gap: space.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
