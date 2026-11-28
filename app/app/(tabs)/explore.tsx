import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CityButton, FilterBar } from '../../src/components/ui';
import { BIELEFELD, CITIES, catInfo, distanceKm, fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { PhotoGrid, PhotoPin, T, hit, radius, space, useColors, useIsDark, dock } from '../../src/ui';

type Mode = 'map' | 'grid';
const CARD_W = 150;
const CARD_H = 190;

/** Entdecken: Umschalter Karte ↔ Raster, Filter schweben oben. */
export default function Explore() {
  const c = useColors();
  const dark = useIsDark();
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const { visible, setMapCenter, city, me, realLocation, locate } = useStore();
  const [mode, setMode] = useState<Mode>('map');
  const [selId, setSelId] = useState<number | null>(null);
  const [livePins, setLivePins] = useState(true);
  const [headerH, setHeaderH] = useState(120);
  const dockTop = Math.max(insets.bottom + dock.bottom, space.sm) + dock.size + space.sm;
  const sorted = [...visible].sort((a, b) => a.dist - b.dist);
  const list = useRef<FlatList<(typeof sorted)[number]>>(null);
  const fromCarousel = useRef(false);

  function focus(s: (typeof sorted)[number]) {
    setSelId(s.id);
    map.current?.animateCamera({ center: { latitude: s.lat - 0.0012, longitude: s.lon } }, { duration: 350 });
  }
  // Wischen in der Leiste wählt den Spot und schwenkt die Karte
  const onViewable = useRef(({ viewableItems }: { viewableItems: { item: (typeof sorted)[number] }[] }) => {
    const first = viewableItems[0]?.item;
    if (first && fromCarousel.current) focus(first);
  }).current;

  useEffect(() => {
    setLivePins(true);
    const id = setTimeout(() => setLivePins(false), 1500);
    return () => clearTimeout(id);
  }, [visible, selId, mode]);

  // Stadt gewechselt (hier oder auf Home): Karte fliegt hin.
  const shownCity = useRef(city);
  useEffect(() => {
    if (shownCity.current === city) return;
    shownCity.current = city;
    map.current?.animateToRegion(CITIES[city].region, 700);
  }, [city, mode]);

  const centered = useRef(false);
  useEffect(() => {
    if (realLocation && !centered.current && distanceKm(me, { lat: BIELEFELD.latitude, lon: BIELEFELD.longitude }) < 30) {
      centered.current = true;
      map.current?.animateToRegion({ latitude: me.lat, longitude: me.lon, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
    }
  }, [realLocation, me]);

  async function goToMe() {
    const here = realLocation ? me : await locate();
    if (here) map.current?.animateToRegion({ latitude: here.lat, longitude: here.lon, latitudeDelta: 0.015, longitudeDelta: 0.015 }, 500);
  }


  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      {mode === 'map' ? (
        <MapView
          ref={map}
          style={StyleSheet.absoluteFill}
          initialRegion={CITIES[city].region}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          showsPointsOfInterests={false}
          userInterfaceStyle={dark ? 'dark' : 'light'}
          onRegionChangeComplete={(r) => setMapCenter({ lat: r.latitude, lon: r.longitude })}
          onPress={() => setSelId(null)}
          mapPadding={{ top: headerH, bottom: CARD_H + dockTop + space.sm, left: 0, right: 0 }}
        >
          {visible.map((s) => {
            const active = selId === s.id;
            return (
              <Marker
                key={s.id}
                coordinate={{ latitude: s.lat, longitude: s.lon }}
                onPress={(e) => {
                  e.stopPropagation();
                  focus(s);
                  const i = sorted.findIndex((x) => x.id === s.id);
                  fromCarousel.current = false;
                  if (i >= 0) list.current?.scrollToIndex({ index: i, animated: true });
                }}
                tracksViewChanges={livePins}
                zIndex={active ? 10 : 1}
                anchor={{ x: 0.5, y: 1 }}
                accessibilityLabel={s.name}
              >
                <PhotoPin photo={s.images[0]} dot={catInfo(s.cats[0]).color} icon={catInfo(s.cats[0]).icon} active={active} />
              </Marker>
            );
          })}
        </MapView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: headerH, paddingBottom: dock.clearance }}>
          {sorted.length ? (
            <PhotoGrid
              layout="mosaic"
              items={sorted.map((s) => ({
                key: String(s.id), photo: s.images[0], label: `${s.name}, ${fmtDist(s.dist)}`,
                onPress: () => router.push(`/spot/${s.id}`),
              }))}
            />
          ) : (
            <View style={st.empty}>
              <T variant="title">Keine Spots für diesen Filter</T>
              <T color="asphalt">Wähle eine andere Kategorie oder lade selbst einen Spot hoch.</T>
            </View>
          )}
        </ScrollView>
      )}

      <BlurView
        intensity={mode === 'map' ? 70 : 90}
        tint={dark ? 'dark' : 'light'}
        style={[st.header, { paddingTop: insets.top + space.xs }]}
        onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
      >
        <View style={st.top}>
          <T variant="title" accessibilityRole="header">fitspot</T>
          <CityButton onSwitch={() => setSelId(null)} />
          <View style={{ flex: 1 }} />
          <View style={[st.seg, { backgroundColor: c.fill }]} accessibilityRole="tablist">
            {(['map', 'grid'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => { setMode(m); setSelId(null); }}
                hitSlop={{ top: 6, bottom: 6 }}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === m }}
                accessibilityLabel={m === 'map' ? 'Karte' : 'Raster'}
                style={[st.segBtn, mode === m && { backgroundColor: c.surface }]}
              >
                <Ionicons name={m === 'map' ? 'map' : 'grid'} size={18} color={mode === m ? c.ink : c.asphalt} />
              </Pressable>
            ))}
          </View>
        </View>
        <FilterBar />
      </BlurView>

      {mode === 'map' ? (
        <BlurView intensity={70} tint={dark ? 'dark' : 'light'} style={[st.fab, { top: headerH + space.md }]}>
          <Pressable onPress={goToMe} style={st.fabInner} accessibilityRole="button" accessibilityLabel="Zu meinem Standort">
            <Ionicons name={realLocation ? 'navigate' : 'navigate-outline'} size={20} color={c.ink} />
          </Pressable>
        </BlurView>
      ) : null}

      {mode === 'map' && sorted.length ? (
        <FlatList
          ref={list}
          horizontal
          data={sorted}
          keyExtractor={(s) => String(s.id)}
          style={[st.carousel, { bottom: dockTop }]}
          contentContainerStyle={{ paddingHorizontal: space.md, gap: space.sm }}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + space.sm}
          decelerationRate="fast"
          getItemLayout={(_, i) => ({ length: CARD_W + space.sm, offset: (CARD_W + space.sm) * i, index: i })}
          onScrollBeginDrag={() => { fromCarousel.current = true; }}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item: s }) => {
            const active = s.id === selId;
            return (
              <Pressable
                onPress={() => router.push(`/spot/${s.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${s.name}, ${fmtDist(s.dist)} entfernt. Öffnen`}
                style={[st.card, { backgroundColor: c.surface, borderColor: active ? c.ink : c.line }]}
              >
                <Image source={s.images[0]} style={st.cardImg} contentFit="cover" />
                <View style={st.cardText}>
                  <T variant="sign" numberOfLines={1}>{s.name}</T>
                  <T variant="small" color="asphalt" numberOfLines={1}>{fmtDist(s.dist)}, {catInfo(s.cats[0]).label}</T>
                </View>
              </Pressable>
            );
          }}
        />
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  seg: { flexDirection: 'row', padding: 3, borderRadius: radius.pill },
  segBtn: { width: hit, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  fab: { position: 'absolute', right: space.md + 2, width: hit, height: hit, borderRadius: radius.thumb, overflow: 'hidden' },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: space.xl, gap: space.sm },
  carousel: { position: 'absolute', left: 0, right: 0, bottom: space.md },
  card: { width: CARD_W, borderRadius: radius.thumb + 2, borderWidth: 1.5, overflow: 'hidden' },
  cardImg: { width: '100%', height: CARD_H - 52 },
  cardText: { paddingHorizontal: space.sm + 2, paddingVertical: space.sm - 2 },
});
