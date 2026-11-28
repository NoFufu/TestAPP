import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { CATS, CITIES, CITY_NAMES, type City } from '../data/spots';
import { useStore } from '../store';
import { CountryCode, T, Tab, haptic, space, useColors } from '../ui';

/** Reiter „Alle“ + Kategorien (mehrere wählbar). Gilt für Karte und Raster. Die Mood-Kreise stehen separat (`MoodStories`). */
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
  city: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  bar: { gap: space.xl, paddingHorizontal: space.lg },
});

/** Land (grau) + Stadt. Tippen wechselt zur nächsten Stadt. */
export function CityButton({ onSwitch }: { onSwitch?: (c: City) => void }) {
  const c = useColors();
  const { city, setCity } = useStore();
  const next = CITY_NAMES[(CITY_NAMES.indexOf(city) + 1) % CITY_NAMES.length];
  return (
    <Pressable hitSlop={space.sm} accessibilityRole="button" accessibilityLabel={`Stadt: ${city}. Tippen für ${next}`}
      onPress={() => { haptic.select(); setCity(next); onSwitch?.(next); }} style={s.city}>
      <CountryCode country={CITIES[city].country} />
      <T variant="title">{city}</T>
      <Ionicons name="chevron-down" size={18} color={c.asphalt} />
    </Pressable>
  );
}
