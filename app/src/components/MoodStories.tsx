import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MOODS, type Mood } from '../data/moods';
import { AI_SPOT_IDS, PHOTO_SPOT_IDS } from '../data/images';
import { useStore } from '../store';
import { T, haptic, moodRing, space, story, useColors } from '../ui';

/** Moods als runde Kreise wie Instagram-Stories: kräftiger Farbring mit Leuchten. Tippen filtert, nochmal tippen hebt auf. */
export function MoodStories() {
  const c = useColors();
  const { spots, city, moodFilter, setMoodFilter } = useStore();
  // Je Mood das beliebteste Foto der Stadt (echte/KI-Fotos zuerst). Moods ohne Spot in der Stadt entfallen.
  const items = useMemo(() => MOODS.map((m: Mood) => {
    const hits = spots.filter((s) => (s.city ?? 'Bielefeld') === city && m.match(s))
      .sort((a, b) => Number(PHOTO_SPOT_IDS.has(b.id) || AI_SPOT_IDS.has(b.id)) - Number(PHOTO_SPOT_IDS.has(a.id) || AI_SPOT_IDS.has(a.id)) || b.likes - a.likes);
    return { m, photo: hits[0]?.images[0], count: hits.length };
  }).filter((x) => x.count > 0), [spots, city]);

  const r = (story.size - story.ring) / 2;
  const photo = story.size - 2 * (story.ring + story.inset);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.row} accessibilityLabel="Nach Stimmung filtern">
      {items.map(({ m, photo: src, count }) => {
        const on = moodFilter === m.key;
        const [from, to] = moodRing[m.key];
        const dim = !!moodFilter && !on; // andere Kreise treten zurück, wenn ein Mood gewählt ist
        return (
          <Pressable key={m.key} accessibilityRole="button" accessibilityState={{ selected: on }}
            accessibilityLabel={`${m.label}, ${count} ${count === 1 ? 'Spot' : 'Spots'}`}
            onPress={() => { haptic.select(); setMoodFilter(on ? null : m.key); }} style={[st.item, { opacity: dim ? 0.5 : 1 }]}>
            {/* Leuchten in der Mood-Farbe hinter dem Ring */}
            <View style={[st.ring, { shadowColor: from, shadowOpacity: on ? 0.55 : 0.28, shadowRadius: on ? story.glow * 1.5 : story.glow, transform: [{ scale: on ? 1.06 : 1 }] }]}>
              <Svg width={story.size} height={story.size} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id={`ring-${m.key}`} x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={from} />
                    <Stop offset="1" stopColor={to} />
                  </LinearGradient>
                </Defs>
                <Circle cx={story.size / 2} cy={story.size / 2} r={r} stroke={`url(#ring-${m.key})`} strokeWidth={story.ring} fill="none" />
              </Svg>
              {src ? <Image source={src} contentFit="cover" style={{ width: photo, height: photo, borderRadius: photo / 2, backgroundColor: c.fill }} />
                : <View style={{ width: photo, height: photo, borderRadius: photo / 2, backgroundColor: c.fill }} />}
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
  row: { gap: story.gap, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm },
  item: { width: story.size, alignItems: 'center', gap: space.xs },
  ring: { width: story.size, height: story.size, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 } },
  label: { textAlign: 'center' },
  badge: { position: 'absolute', right: 0, bottom: 0, width: story.badge, height: story.badge, borderRadius: story.badge / 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
