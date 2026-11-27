import { Image, type ImageSource } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Avatar, IconButton, LikeBurst, SpotSign, T, haptic, useDoubleTap } from './components';
import { useColors } from './theme';
import { space } from './tokens';

/* ---------- SpotCard ---------- */
export type SpotCardProps = {
  name: string;
  place: string;          // z. B. „Westen, 450 m"
  photos: (ImageSource | number)[];
  photoLabels?: string[]; // z. B. ["Der Spot", "Mit Person"]
  creator?: string | null;
  creatorAvatar?: string | null;
  description?: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  hasInstagram?: boolean;
  onLike: () => void;
  onSave: () => void;
  onOpen: () => void;
};
/** Feed-Beitrag für einen Spot: Kopf, Fotos zum Wischen (leer ↔ mit Person), Aktionen, Likes, Text. Doppeltipp = Like. */
export function SpotCard(p: SpotCardProps) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const [burst, setBurst] = useState(0);
  const [page, setPage] = useState(0);
  const tap = useDoubleTap(() => {
    if (!p.liked) p.onLike();
    haptic.like();
    setBurst((n) => n + 1);
  }, p.onOpen);
  const who = p.creator ? p.creator : 'fitspot';

  return (
    <View style={{ backgroundColor: c.paper }}>
      <Pressable style={st.head} onPress={p.onOpen} accessibilityRole="button" accessibilityLabel={`${p.name} öffnen`}>
        <Avatar source={p.creatorAvatar ? { uri: p.creatorAvatar } : undefined} size={32} initials={who.slice(0, 1).toUpperCase()} />
        <View style={{ flex: 1 }}>
          <T variant="name" numberOfLines={1}>{p.name}</T>
          <T variant="small" color="asphalt" numberOfLines={1}>{p.place}</T>
        </View>
      </Pressable>
      <View>
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {p.photos.map((ph, i) => (
            <Pressable key={i} onPress={tap} accessibilityLabel={`${p.name}: ${p.photoLabels?.[i] ?? 'Foto'}. Doppeltippen zum Liken.`}>
              <Image source={ph} style={{ width, height: width * 1.25, backgroundColor: c.fill }} contentFit="cover" transition={150} />
            </Pressable>
          ))}
        </ScrollView>
        {p.photoLabels?.[page] ? <SpotSign name={p.photoLabels[page]} style={st.sign} /> : null}
        {p.photos.length > 1 ? (
          <View style={st.dots} pointerEvents="none">
            {p.photos.map((_, i) => <View key={i} style={[st.dot, { backgroundColor: c.onPhoto, opacity: i === page ? 1 : 0.5 }]} />)}
          </View>
        ) : null}
        <LikeBurst trigger={burst} />
      </View>
      <View style={st.actions}>
        <IconButton
          icon={p.liked ? 'heart' : 'heart-outline'}
          color={p.liked ? c.cherry : c.ink}
          label={p.liked ? 'Like entfernen' : 'Liken'}
          onPress={() => { haptic.like(); p.onLike(); }}
        />
        {p.hasInstagram ? <IconButton icon="logo-instagram" label="Instagram-Post ansehen" onPress={p.onOpen} /> : null}
        <View style={{ flex: 1 }} />
        <IconButton
          icon={p.saved ? 'bookmark' : 'bookmark-outline'}
          label={p.saved ? 'Aus Merkliste entfernen' : 'Merken'}
          onPress={() => { haptic.select(); p.onSave(); }}
        />
      </View>
      <View style={st.text}>
        <T variant="name">{p.likes.toLocaleString('de-DE')} Likes</T>
        {p.description ? <T numberOfLines={3}>{p.description}</T> : null}
        <T variant="small" color="asphalt">Entdeckt von {who}</T>
      </View>
    </View>
  );
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
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, paddingHorizontal: space.md + 2, paddingVertical: space.sm + 2 },
  sign: { position: 'absolute', left: space.md, bottom: space.md },
  dots: { position: 'absolute', right: space.md, bottom: space.lg, flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xs + 2 },
  text: { paddingHorizontal: space.md + 2, paddingBottom: space.lg, gap: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
