import { router } from 'expo-router';
import { useMemo, useRef, type ComponentRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectionCard } from '../../src/components/CollectionCard';
import { CityButton, FilterBar } from '../../src/components/ui';
import { MoodStories } from '../../src/components/MoodStories';
import { useScrollTopOnTab } from '../../src/lib/scrollTop';
import { collectionsFor } from '../../src/data/collections';
import { AI_SPOT_IDS, PHOTO_SPOT_IDS } from '../../src/data/images';
import { fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { IconButton, Masonry, Skeleton, T, pinRatio, space, useColors, type Pin, dock } from '../../src/ui';

const CHUNK = 10;

/** Home: Raster mit allen Fotos der Spots (leer und mit Person). Tippen öffnet den Spot groß. */
export default function Home() {
  const c = useColors();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  useScrollTopOnTab('index', scroll);
  const { visible, spots, city, filters, moodFilter, source, reload, saved, toggleSave } = useStore();
  // Sammlungen nur ohne Filter, sonst passt die Karte nicht zum Feed.
  const cols = useMemo(() => (filters.size || moodFilter ? [] : collectionsFor(spots, city)), [spots, city, filters, moodFilter]);

  const pins = useMemo<Pin[]>(() => {
    const score = (s: (typeof visible)[number]) => (s.creator ? 2 : 0) + (PHOTO_SPOT_IDS.has(s.id) || AI_SPOT_IDS.has(s.id) ? 1 : 0);
    const ordered = [...visible].sort((a, b) => score(b) - score(a) || a.dist - b.dist);
    return ordered
      .flatMap((s, i) => s.images.map((img, k) => ({ s, img, k, order: i + k * 5 })))
      .sort((a, b) => a.order - b.order)
      .map(({ s, img, k }) => ({
        key: `${s.id}-${k}`,
        photo: img,
        ratio: pinRatio(s.id * 3 + k),
        title: s.name,
        subtitle: `${s.area || s.city || 'Bielefeld'}, ${fmtDist(s.dist)}`,
        label: `${s.name}, ${s.city === 'Barcelona' ? `Ansicht ${k + 1}` : k ? 'mit Person' : 'der Spot'}, ${fmtDist(s.dist)} entfernt. Öffnen`,
        saved: saved.has(s.id),
        onPress: () => router.push({ pathname: '/spot/[id]', params: { id: String(s.id), photo: String(k) } }),
        onSave: () => toggleSave(s.id),
      }));
  }, [visible, saved, toggleSave]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView
        ref={scroll}
        stickyHeaderIndices={[1]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={c.asphalt} />}
        contentContainerStyle={{ paddingBottom: dock.clearance }}
      >
        <View style={st.bar}>
          <T variant="title" accessibilityRole="header">fitspot</T>
          <CityButton />
          <View style={{ flex: 1 }} />
          <IconButton icon="search" size={26} label="Suchen und filtern" onPress={() => router.push('/search')} />
          <IconButton icon="add" size={30} label="Neuen Spot hochladen" onPress={() => router.push('/upload')} />
        </View>
        <View style={{ backgroundColor: c.paper }}>
          <FilterBar />
        </View>
        {/* Mood-Kreise scrollen mit weg: nur ganz oben sichtbar */}
        <MoodStories />
        {source === 'loading' ? (
          <View style={st.loading} accessible accessibilityLabel="Spots werden geladen">
            <Skeleton style={{ flex: 1, height: 260, borderRadius: 16 }} />
            <Skeleton style={{ flex: 1, height: 200, borderRadius: 16 }} />
          </View>
        ) : pins.length ? (
          // Alle 10 Bilder eine Sammlungs-Karte, danach geht das Raster weiter.
          Array.from({ length: Math.ceil(pins.length / CHUNK) }, (_, i) => (
            <View key={i}>
              <Masonry pins={pins.slice(i * CHUNK, (i + 1) * CHUNK)} />
              {cols[i] && (i + 1) * CHUNK < pins.length ? <CollectionCard col={cols[i].c} items={cols[i].items} city={city} /> : null}
            </View>
          ))
        ) : (
          <View style={st.empty}>
            <T variant="title">Keine Spots für diesen Filter</T>
            <T color="asphalt">Wähle eine andere Kategorie oder lade selbst einen Spot hoch.</T>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  bar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingLeft: space.lg, paddingRight: space.sm },
  loading: { flexDirection: 'row', gap: space.sm, padding: space.sm },
  empty: { padding: space.xl, gap: space.sm },
});
