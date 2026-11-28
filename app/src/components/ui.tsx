import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { CATS, CITIES, CITY_NAMES, COLORS, type City } from '../data/spots';
import { useStore } from '../store';
import { Swatch, T, Tab, haptic, space, useColors } from '../ui';

/** Filterleiste: „Alle“ + Kategorien, mehrere gleichzeitig wählbar. Gilt für Karte und Raster. */
export function FilterBar() {
  const { filters, toggleFilter, clearFilters, colorFilter, setColorFilter } = useStore();
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.bar}>
        <Tab label="Alle" selected={!filters.size} onPress={clearFilters} />
        {CATS.map((c) => (
          <Tab key={c.key} label={c.label} selected={filters.has(c.key)} onPress={() => toggleFilter(c.key)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.colors}
        accessibilityLabel="Nach Farbe filtern">
        {COLORS.map((c) => (
          <Swatch key={c.key} color={c.hex} label={c.label} selected={colorFilter === c.key}
            onPress={() => setColorFilter(colorFilter === c.key ? null : c.key)} />
        ))}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  city: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  bar: { gap: space.xl, paddingHorizontal: space.lg },
  colors: { gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.xs, alignItems: 'center' },
});

/** Land (grau) + Stadt. Tippen wechselt zur nächsten Stadt. */
export function CityButton({ onSwitch }: { onSwitch?: (c: City) => void }) {
  const c = useColors();
  const { city, setCity } = useStore();
  const next = CITY_NAMES[(CITY_NAMES.indexOf(city) + 1) % CITY_NAMES.length];
  return (
    <Pressable hitSlop={space.sm} accessibilityRole="button" accessibilityLabel={`Stadt: ${city}. Tippen für ${next}`}
      onPress={() => { haptic.select(); setCity(next); onSwitch?.(next); }} style={s.city}>
      <T variant="title" color="asphalt">{CITIES[city].country}</T>
      <T variant="title">{city}</T>
      <Ionicons name="chevron-down" size={18} color={c.asphalt} />
    </Pressable>
  );
}
