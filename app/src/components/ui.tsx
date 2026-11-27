import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip as UIChip } from '../ui';
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
  return <UIChip label={label} dot={color} selected={active} onPress={onPress} />;
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
});
