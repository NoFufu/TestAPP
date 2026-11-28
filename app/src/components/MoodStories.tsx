import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MOODS, type Mood } from '../data/moods';
import { AI_SPOT_IDS, PHOTO_SPOT_IDS } from '../data/images';
import { useStore } from '../store';
import { Avatar, T, haptic, space, story, useColors } from '../ui';

/** Moods als runde Kreise wie Instagram-Stories. Tippen filtert, nochmal tippen hebt auf. */
export function MoodStories() {
  const c = useColors();
  const { spots, city, moodFilter, setMoodFilter } = useStore();
  // Je Mood das beliebteste Foto der Stadt (echte/KI-Fotos zuerst). Moods ohne Spot in der Stadt entfallen.
  const items = useMemo(() => MOODS.map((m: Mood) => {
    const hits = spots.filter((s) => (s.city ?? 'Bielefeld') === city && m.match(s))
      .sort((a, b) => Number(PHOTO_SPOT_IDS.has(b.id) || AI_SPOT_IDS.has(b.id)) - Number(PHOTO_SPOT_IDS.has(a.id) || AI_SPOT_IDS.has(a.id)) || b.likes - a.likes);
    return { m, photo: hits[0]?.images[0], count: hits.length };
  }).filter((x) => x.count > 0), [spots, city]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.row} accessibilityLabel="Nach Stimmung filtern">
      {items.map(({ m, photo, count }) => {
        const on = moodFilter === m.key;
        return (
          <Pressable key={m.key} accessibilityRole="button" accessibilityState={{ selected: on }}
            accessibilityLabel={`${m.label}, ${count} ${count === 1 ? 'Spot' : 'Spots'}`}
            onPress={() => { haptic.select(); setMoodFilter(on ? null : m.key); }} style={st.item}>
            <View>
              <Avatar source={photo} size={story.size} ring={on ? 'new' : 'accent'} />
              <View style={[st.badge, { backgroundColor: c.ink, borderColor: c.paper }]}>
                <Ionicons name={m.icon} size={13} color={c.onInk} />
              </View>
            </View>
            <T variant="small" color={on ? 'ink' : 'asphalt'} numberOfLines={2} style={[st.label, on && { fontWeight: '600' }]}>{m.label}</T>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  row: { gap: story.gap, paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.sm },
  item: { width: story.size, alignItems: 'center', gap: space.xs },
  label: { textAlign: 'center' },
  badge: { position: 'absolute', right: 0, bottom: 0, width: story.badge, height: story.badge, borderRadius: story.badge / 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
