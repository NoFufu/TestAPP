import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { MOODS } from '../data/moods';
import { CATS } from '../data/spots';
import { useStore } from '../store';
import { Chip, T, hit, radius, space, type, useColors, useIsDark } from '../ui';

/** Ausklappbare Suche über der Karte: Text + Kategorie- und Mood-Chips. Mehr Filter in der großen Suche. */
export function MapSearch({ top, q, setQ }: { top: number; q: string; setQ: (t: string) => void }) {
  const c = useColors();
  const dark = useIsDark();
  const { filters, toggleFilter, moodFilter, setMoodFilter } = useStore();
  return (
    <BlurView intensity={80} tint={dark ? 'dark' : 'light'} style={[st.panel, { top, borderColor: c.line }]}>
      <View style={[st.field, { backgroundColor: c.fill }]}>
        <Ionicons name="search" size={18} color={c.asphalt} />
        <TextInput value={q} onChangeText={setQ} placeholder="Spot, Viertel oder Stichwort" placeholderTextColor={c.asphalt}
          autoFocus returnKeyType="search" autoCorrect={false} accessibilityLabel="Auf der Karte suchen"
          style={[type.body, st.input, { color: c.ink }]} />
        {q ? (
          <Pressable hitSlop={space.md} accessibilityRole="button" accessibilityLabel="Suche leeren" onPress={() => setQ('')}>
            <Ionicons name="close-circle" size={18} color={c.asphalt} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={st.chips}>
        {CATS.map((k) => <Chip key={k.key} label={k.label} dot={k.color} selected={filters.has(k.key)} onPress={() => toggleFilter(k.key)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={st.chips}>
        {MOODS.map((m) => <Chip key={m.key} label={m.label} selected={moodFilter === m.key} onPress={() => setMoodFilter(moodFilter === m.key ? null : m.key)} />)}
      </ScrollView>
      <Pressable accessibilityRole="button" onPress={() => router.push('/search')} style={st.more}>
        <Ionicons name="options-outline" size={16} color={c.ink} />
        <T variant="label">Erweiterte Suche mit Farben und Entfernung</T>
      </Pressable>
    </BlurView>
  );
}

const st = StyleSheet.create({
  panel: { position: 'absolute', left: space.sm, right: space.sm, borderRadius: radius.card, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, paddingVertical: space.sm, gap: space.sm },
  field: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: hit, borderRadius: radius.pill, marginHorizontal: space.sm, paddingHorizontal: space.md },
  input: { flex: 1, paddingVertical: space.sm },
  chips: { gap: space.sm, paddingHorizontal: space.sm, alignItems: 'center' },
  more: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, minHeight: 36 },
});
