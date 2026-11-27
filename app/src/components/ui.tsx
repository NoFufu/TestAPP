import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CATS, catInfo, type Cat } from '../data/spots';
import { useStore } from '../store';
import { useTheme } from '../theme';

export function Tag({ cat, onPhoto }: { cat: Cat; onPhoto?: boolean }) {
  const t = useTheme();
  const c = catInfo(cat);
  return (
    <View style={[s.tag, { backgroundColor: onPhoto ? 'rgba(255,255,255,0.18)' : c.color + '29' }]}>
      <View style={[s.dot, { backgroundColor: c.color }]} />
      <Text style={[s.tagText, { color: onPhoto ? t.onPhoto : t.ink }]}>{c.label}</Text>
    </View>
  );
}

export function Tags({ cats, onPhoto }: { cats: Cat[]; onPhoto?: boolean }) {
  return (
    <View style={s.tags}>
      {cats.map((c) => <Tag key={c} cat={c} onPhoto={onPhoto} />)}
    </View>
  );
}

export function Chip({ label, color, active, onPress }: { label: string; color?: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[s.chip, { backgroundColor: active ? t.ink : t.surface, borderColor: active ? t.ink : t.line }]}
    >
      {color ? <View style={[s.dot, { backgroundColor: color, width: 9, height: 9 }]} /> : null}
      <Text style={[s.chipText, { color: active ? t.bg : t.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** Filterleiste: „Alle“ + Kategorien, mehrere gleichzeitig wählbar. */
export function FilterBar() {
  const { filters, toggleFilter, clearFilters } = useStore();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bar}>
      <Chip label="Alle" active={!filters.size} onPress={clearFilters} />
      {CATS.map((c) => (
        <Chip key={c.key} label={c.label} color={c.color} active={filters.has(c.key)} onPress={() => toggleFilter(c.key)} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  tagText: { fontSize: 11.5, fontWeight: '600' },
  dot: { width: 7, height: 7, borderRadius: 5 },
  bar: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 13.5, fontWeight: '500' },
});
