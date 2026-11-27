import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PHOTO_SPOT_IDS } from '../../src/data/images';
import { CATS, SHORT, fmtDist, type Cat } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { Avatar, Skeleton, SpotCard, T, space, useColors } from '../../src/ui';

/** Home: Story-Leiste mit Kategorien, darunter Spots. Neue Uploads und Spots mit Fotos zuerst. */
export default function Home() {
  const c = useColors();
  const { spots, source, reload, saved, toggleSave, likedPosts, toggleLikePost, filters, toggleFilter, clearFilters } = useStore();

  const feed = useMemo(() => {
    const score = (s: (typeof spots)[number]) => (s.creator ? 2 : 0) + (PHOTO_SPOT_IDS.has(s.id) ? 1 : 0);
    return [...spots].sort((a, b) => score(b) - score(a) || b.id - a.id);
  }, [spots]);

  const stories = useMemo(
    () => CATS.map((cat) => ({
      ...cat,
      spot: [...spots].sort((a, b) => Number(PHOTO_SPOT_IDS.has(b.id)) - Number(PHOTO_SPOT_IDS.has(a.id)) || a.dist - b.dist)
        .find((s) => s.cats.includes(cat.key)),
    })).filter((x) => x.spot),
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
        <View style={{ padding: space.md, gap: space.md }} accessible accessibilityLabel="Spots werden geladen">
          <Skeleton style={{ height: 32, width: 160, borderRadius: 16 }} />
          <Skeleton style={{ aspectRatio: 4 / 5, width: '100%' }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <FlatList
        data={feed}
        keyExtractor={(s) => String(s.id)}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={c.asphalt} />}
        ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
        renderItem={({ item: s }) => {
          const key = `spot:${s.id}`;
          const liked = likedPosts.has(key);
          return (
            <SpotCard
              name={s.name}
              place={`${s.area || 'Bielefeld'}, ${fmtDist(s.dist)}`}
              photos={s.images}
              photoLabels={s.images.length > 1 ? ['Der Spot', 'Mit Person'] : ['Der Spot']}
              creator={s.creator}
              creatorAvatar={s.creatorAvatar}
              description={s.desc}
              likes={s.likes + (liked ? 1 : 0)}
              liked={liked}
              saved={saved.has(s.id)}
              hasInstagram={!!s.instagramUrl}
              onLike={() => toggleLikePost(key)}
              onSave={() => toggleSave(s.id)}
              onOpen={() => router.push(`/spot/${s.id}`)}
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
});
