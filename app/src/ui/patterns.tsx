import { Image, type ImageSource } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Avatar, IconButton, LikeBurst, SpotSign, T, haptic, useDoubleTap } from './components';
import { useColors } from './theme';
import { space } from './tokens';

/* ---------- PostCard ---------- */
export type PostCardProps = {
  author: string;
  avatar?: ImageSource | number;
  when?: string;
  photo: ImageSource | number;
  spotName: string;
  distance?: string;
  caption?: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onOpenSpot: () => void;
  onShare?: () => void;
};
/** Feed-Beitrag: Kopf, Foto 4:5 randlos mit Spot-Schild, Aktionen, Likes, Bildtext. Doppeltipp = Like. */
export function PostCard(p: PostCardProps) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const [burst, setBurst] = useState(0);
  const tap = useDoubleTap(() => {
    if (!p.liked) p.onLike();
    haptic.like();
    setBurst((n) => n + 1);
  });

  return (
    <View style={{ backgroundColor: c.paper }}>
      <View style={st.head}>
        <Avatar source={p.avatar} size={32} label={p.author} />
        <T variant="name">{p.author}</T>
        {p.when ? <T variant="small" color="asphalt">{p.when}</T> : null}
      </View>
      <Pressable onPress={tap} accessibilityLabel={`Foto von ${p.author} am Spot ${p.spotName}. Doppeltippen zum Liken.`}>
        <Image source={p.photo} style={{ width, height: width * 1.25, backgroundColor: c.fill }} contentFit="cover" transition={150} />
        <SpotSign name={p.spotName} distance={p.distance} onPress={p.onOpenSpot} style={st.sign} />
        <LikeBurst trigger={burst} />
      </Pressable>
      <View style={st.actions}>
        <IconButton
          icon={p.liked ? 'heart' : 'heart-outline'}
          color={p.liked ? c.cherry : c.ink}
          label={p.liked ? 'Like entfernen' : 'Liken'}
          onPress={() => { haptic.like(); p.onLike(); }}
        />
        {p.onShare ? <IconButton icon="paper-plane-outline" label="Teilen" onPress={p.onShare} /> : null}
        <View style={{ flex: 1 }} />
        <IconButton
          icon={p.saved ? 'bookmark' : 'bookmark-outline'}
          label={p.saved ? 'Aus Merkliste entfernen' : 'Merken'}
          onPress={() => { haptic.select(); p.onSave(); }}
        />
      </View>
      <View style={st.text}>
        <T variant="name">{p.likes.toLocaleString('de-DE')} Likes</T>
        {p.caption ? (
          <T>
            <T variant="name">{p.author} </T>
            {p.caption}
          </T>
        ) : null}
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
          <Pressable key={it.key} onPress={it.onPress} accessibilityLabel={it.label}>
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
          <Pressable key={big.key} onPress={big.onPress} accessibilityLabel={big.label}>
            <Image source={big.photo} style={{ width: cell * 2 + gap, height: cell * 2 + gap, backgroundColor: c.fill }} contentFit="cover" />
          </Pressable>
        );
        const Small = (
          <View key="s" style={{ gap }}>
            {small.map((it) => (
              <Pressable key={it.key} onPress={it.onPress} accessibilityLabel={it.label}>
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
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xs + 2 },
  text: { paddingHorizontal: space.md + 2, paddingBottom: space.lg, gap: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
