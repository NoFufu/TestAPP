import { ScrollView, StyleSheet } from 'react-native';
import { CATS } from '../data/spots';
import { useStore } from '../store';
import { Tab, space } from '../ui';

/** Filterleiste: „Alle“ + Kategorien, mehrere gleichzeitig wählbar. Gilt für Karte und Raster. */
export function FilterBar() {
  const { filters, toggleFilter, clearFilters } = useStore();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bar}>
      <Tab label="Alle" selected={!filters.size} onPress={clearFilters} />
      {CATS.map((c) => (
        <Tab key={c.key} label={c.label} selected={filters.has(c.key)} onPress={() => toggleFilter(c.key)} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bar: { gap: space.xl, paddingHorizontal: space.lg },
});
