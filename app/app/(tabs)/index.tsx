import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PHOTO_SPOT_IDS } from '../../src/data/images';
import { buildPosts, fmtAgo } from '../../src/data/posts';
import { CATS, SHORT, fmtDist, type Cat } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { Avatar, PostCard, Skeleton, T, space, useColors } from '../../src/ui';

/** Home: Story-Leiste mit Kategorien, darunter Outfit-Beiträge an Spots. */
export default function Home() {
  const c = useColors();
  const { spots, source, reload, saved, toggleSave, likedPosts, toggleLikePost, filters, toggleFilter, clearFilters } = useStore();
  const posts = useMemo(() => buildPosts(spots), [spots]);
  const byId = useMemo(() => new Map(spots.map((s) => [s.id, s])), [spots]);

  // Story-Bild je Kategorie: Titelbild des nächstgelegenen Spots dieser Kategorie
  const stories = useMemo(
    () => CATS.map((cat) => ({ ...cat, spot: [...spots].sort((a, b) => Number(PHOTO_SPOT_IDS.has(b.id)) - Number(PHOTO_SPOT_IDS.has(a.id)) || a.dist - b.dist).find((s) => s.cats.includes(cat.key)) }))
      .filter((x) => x.spot),
    [spots],
  );

  function openCategory(cat: Cat) {
    clearFilters();
    if (!filters.has(cat)) toggleFilter(cat);
    router.navigate('/explore');
  }

  const header = (
    <View>
      <View style={st.bar}>
        <T variant="title" accessibilityRole="header">fitspot</T>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.stories}>
        {stories.map((s) => (
          <Pressable key={s.key} onPress={() => openCategory(s.key)} style={st.story} accessibilityRole="button" accessibilityLabel={`${s.label}-Spots anzeigen`}>
            <Avatar source={s.spot!.images[0]} size={64} ring="new" />
            <T variant="small" numberOfLines={1}>{SHORT[s.key] ?? s.label}</T>
          </Pressable>
        ))}
      </ScrollView>
      <View style={[st.sep, { backgroundColor: c.line }]} />
    </View>
  );

  if (source === 'loading') {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
        {header}
        <View style={{ padding: space.md, gap: space.md }} accessible accessibilityLabel="Beiträge werden geladen">
          <Skeleton style={{ height: 32, width: 160, borderRadius: 16 }} />
          <Skeleton style={{ aspectRatio: 4 / 5, width: '100%' }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={c.asphalt} />}
        ListFooterComponent={
          <T variant="small" color="asphalt" style={st.footer}>
            Beispiel-Beiträge. Echte Outfits von euch kommen mit dem Login.
          </T>
        }
        renderItem={({ item: p }) => {
          const s = byId.get(p.spotId);
          if (!s) return null;
          const liked = likedPosts.has(p.id);
          return (
            <PostCard
              author={p.author}
              when={fmtAgo(p.hoursAgo)}
              photo={s.images[1]}
              spotName={s.name}
              distance={fmtDist(s.dist)}
              caption={p.caption}
              likes={p.likes + (liked ? 1 : 0)}
              liked={liked}
              saved={saved.has(s.id)}
              onLike={() => toggleLikePost(p.id)}
              onSave={() => toggleSave(s.id)}
              onOpenSpot={() => router.push(`/spot/${s.id}`)}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: space.lg },
  stories: { gap: space.md + 2, paddingHorizontal: space.lg, paddingVertical: space.sm },
  story: { alignItems: 'center', gap: space.xs, width: 70 },
  sep: { height: StyleSheet.hairlineWidth },
  footer: { textAlign: 'center', padding: space.xl },
});
