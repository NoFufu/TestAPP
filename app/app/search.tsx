import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOODS, moodTint, type MoodKey } from '../src/data/moods';
import { CATS, CITY_NAMES, COLORS, fmtDist, type Cat, type City } from '../src/data/spots';
import type { SpotColor } from '../src/lib/colors';
import { useStore } from '../src/store';
import { Chip, IconButton, Masonry, Swatch, T, haptic, hit, pinRatio, radius, space, type, useColors, type Pin } from '../src/ui';

const DISTANCES: { label: string; km: number | null }[] = [
  { label: 'Egal', km: null }, { label: 'bis 1 km', km: 1 }, { label: 'bis 3 km', km: 3 }, { label: 'bis 10 km', km: 10 },
];
/** Ohne Akzente und Groß-/Kleinschreibung vergleichen (Café = cafe). */
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Suche mit Filtern: Text (Name, Viertel, Beschreibung) + Stadt, Kategorie, Mood, Farbe, Entfernung, echte Fotos. */
export default function Search() {
  const c = useColors();
  const { spots, city, saved, toggleSave } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [cityF, setCityF] = useState<City | null>(city);
  const [cats, setCats] = useState<Set<Cat>>(new Set());
  const [moods, setMoods] = useState<Set<MoodKey>>(new Set());
  const [colors, setColors] = useState<Set<SpotColor>>(new Set());
  const [dist, setDist] = useState<number | null>(null);
  const [real, setReal] = useState(false);

  const flip = <K,>(set: Set<K>, k: K, put: (s: Set<K>) => void) => { const n = new Set(set); n.has(k) ? n.delete(k) : n.add(k); put(n); };
  const count = (cityF && cityF !== city ? 1 : 0) + (!cityF ? 1 : 0) + cats.size + moods.size + colors.size + (dist ? 1 : 0) + (real ? 1 : 0);
  const reset = () => { setCityF(city); setCats(new Set()); setMoods(new Set()); setColors(new Set()); setDist(null); setReal(false); };

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    const moodFns = MOODS.filter((m) => moods.has(m.key));
    const scored = spots.filter((s) =>
      (!cityF || (s.city ?? 'Bielefeld') === cityF)
      && (!cats.size || s.cats.some((x) => cats.has(x)))
      && (!moodFns.length || moodFns.some((m) => m.match(s)))
      && (!colors.size || !!s.colors?.some((x) => colors.has(x)))
      && (dist == null || s.dist <= dist)
      && (!real || !!s.creator || !!s.user))
      .map((s) => {
        // Treffer im Namen zählen mehr als im Beschreibungstext.
        const name = norm(s.name), rest = norm(`${s.area} ${s.city ?? ''} ${s.desc} ${s.cats.map((x) => CATS.find((k) => k.key === x)?.label).join(' ')} ${MOODS.filter((m) => m.match(s)).map((m) => m.label).join(' ')}`);
        let score = 0;
        for (const w of words) { if (name.includes(w)) score += 2; else if (rest.includes(w)) score += 1; else return { s, score: -1 }; }
        return { s, score };
      })
      .filter((x) => x.score >= 0);
    return scored.sort((a, b) => b.score - a.score || a.s.dist - b.s.dist).map((x) => x.s);
  }, [spots, q, cityF, cats, moods, colors, dist, real]);

  const pins: Pin[] = results.map((s) => ({
    key: String(s.id), photo: s.images[0], ratio: pinRatio(s.id * 3), title: s.name, tint: moodTint(s),
    label: `${s.name}, ${fmtDist(s.dist)}. Öffnen`, saved: saved.has(s.id),
    onPress: () => router.push(`/spot/${s.id}`), onSave: () => toggleSave(s.id),
  }));

  const group = (title: string, children: React.ReactNode) => (
    <View style={st.group}>
      <T variant="label" color="asphalt">{title}</T>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <View style={[st.field, { backgroundColor: c.fill }]}>
          <Ionicons name="search" size={18} color={c.asphalt} />
          <TextInput value={q} onChangeText={setQ} placeholder="Spot, Viertel oder Stichwort" placeholderTextColor={c.asphalt}
            autoFocus returnKeyType="search" autoCorrect={false} accessibilityLabel="Suchen"
            style={[type.body, st.input, { color: c.ink }]} />
          {q ? (
            <Pressable hitSlop={space.md} accessibilityRole="button" accessibilityLabel="Suche leeren" onPress={() => setQ('')}>
              <Ionicons name="close-circle" size={18} color={c.asphalt} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={st.bar}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`Filter${count ? `, ${count} aktiv` : ''}`}
            onPress={() => { haptic.select(); setOpen(!open); }}
            style={[st.filterBtn, { backgroundColor: open || count ? c.ink : c.surface, borderColor: open || count ? c.ink : c.line }]}>
            <Ionicons name="options-outline" size={16} color={open || count ? c.onInk : c.ink} />
            <T variant="label" style={{ color: open || count ? c.onInk : c.ink }}>Filter{count ? ` · ${count}` : ''}</T>
          </Pressable>
          {count ? <Pressable hitSlop={space.md} accessibilityRole="button" onPress={reset}><T variant="label" color="asphalt">Zurücksetzen</T></Pressable> : null}
          <View style={{ flex: 1 }} />
          <T variant="small" color="asphalt">{results.length} {results.length === 1 ? 'Spot' : 'Spots'}</T>
        </View>

        {open ? (
          <View style={st.panel}>
            {group('Stadt', (
              <View style={st.wrap}>
                <Chip label="Alle" selected={!cityF} onPress={() => setCityF(null)} />
                {CITY_NAMES.map((n) => <Chip key={n} label={n} selected={cityF === n} onPress={() => setCityF(n)} />)}
              </View>
            ))}
            {group('Kategorie', (
              <View style={st.wrap}>
                {CATS.map((k) => <Chip key={k.key} label={k.label} dot={k.color} selected={cats.has(k.key)} onPress={() => flip(cats, k.key, setCats)} />)}
              </View>
            ))}
            {group('Mood', (
              <View style={st.wrap}>
                {MOODS.map((m) => <Chip key={m.key} label={m.label} selected={moods.has(m.key)} onPress={() => flip(moods, m.key, setMoods)} />)}
              </View>
            ))}
            {group('Farbe', (
              <View style={st.wrap}>
                {COLORS.map((k) => <Swatch key={k.key} color={k.hex} label={k.label} selected={colors.has(k.key)} onPress={() => flip(colors, k.key, setColors)} />)}
              </View>
            ))}
            {group('Entfernung von dir', (
              <View style={st.wrap}>
                {DISTANCES.map((d) => <Chip key={d.label} label={d.label} selected={dist === d.km} onPress={() => setDist(d.km)} />)}
              </View>
            ))}
            {group('Fotos', (
              <View style={st.wrap}>
                <Chip label="Nur mit echten Fotos von Nutzern" selected={real} onPress={() => setReal(!real)} />
              </View>
            ))}
          </View>
        ) : null}

        {pins.length ? <Masonry pins={pins} /> : (
          <View style={st.empty}>
            <T variant="title">Nichts gefunden</T>
            <T color="asphalt">Probier ein anderes Stichwort oder nimm einen Filter weg.</T>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingLeft: space.sm, paddingRight: space.lg, paddingBottom: space.sm },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: hit, borderRadius: radius.pill, paddingHorizontal: space.md },
  input: { flex: 1, paddingVertical: space.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.sm },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, minHeight: 36 },
  panel: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.lg },
  group: { gap: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  empty: { padding: space.xl, gap: space.sm },
});
