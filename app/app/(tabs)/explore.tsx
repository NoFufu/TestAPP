import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image as RNImage, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterBar } from '../../src/components/ui';
import { BIELEFELD, catInfo, distanceKm, fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { PhotoGrid, SpotSign, T, hit, radius, space, useColors, useIsDark } from '../../src/ui';

type Mode = 'map' | 'grid';

/** Entdecken: Umschalter Karte ↔ Raster, Filter schweben oben. */
export default function Explore() {
  const c = useColors();
  const dark = useIsDark();
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const { visible, setMapCenter, source, me, realLocation, locate } = useStore();
  const [mode, setMode] = useState<Mode>('map');
  const [selId, setSelId] = useState<number | null>(null);
  const [livePins, setLivePins] = useState(true);
  const [headerH, setHeaderH] = useState(120);
  const sel = visible.find((s) => s.id === selId) ?? null;

  useEffect(() => {
    setLivePins(true);
    const id = setTimeout(() => setLivePins(false), 1500);
    return () => clearTimeout(id);
  }, [visible, selId, mode]);

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

  const status = source === 'loading' ? 'lädt …' : `${visible.length} Spots${source === 'local' ? ', offline' : ''}`;
  const sorted = [...visible].sort((a, b) => a.dist - b.dist);

  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      {mode === 'map' ? (
        <MapView
          ref={map}
          style={StyleSheet.absoluteFill}
          initialRegion={BIELEFELD}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          showsPointsOfInterests={false}
          userInterfaceStyle={dark ? 'dark' : 'light'}
          onRegionChangeComplete={(r) => setMapCenter({ lat: r.latitude, lon: r.longitude })}
          onPress={() => setSelId(null)}
          mapPadding={{ top: headerH, bottom: sel ? 150 : 0, left: 0, right: 0 }}
        >
          {visible.map((s) => {
            const active = selId === s.id;
            return (
              <Marker
                key={s.id}
                coordinate={{ latitude: s.lat, longitude: s.lon }}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelId(s.id);
                  map.current?.animateCamera({ center: { latitude: s.lat - 0.0015, longitude: s.lon } }, { duration: 350 });
                }}
                tracksViewChanges={livePins}
                zIndex={active ? 10 : 1}
                anchor={{ x: 0.5, y: 1 }}
                accessibilityLabel={s.name}
              >
                <View style={{ alignItems: 'center' }}>
                  <View style={[st.pin, { borderColor: active ? c.ink : c.surface, shadowColor: c.shadow }, active && st.pinActive]}>
                    <RNImage source={s.images[0]} style={st.pinImg} />
                    <View style={[st.pinDot, { backgroundColor: catInfo(s.cats[0]).color, borderColor: c.surface }]} />
                  </View>
                  <View style={[st.pinTip, { borderTopColor: active ? c.ink : c.surface }]} />
                </View>
              </Marker>
            );
          })}
        </MapView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: headerH, paddingBottom: space.xxl }}>
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
          <T variant="title" accessibilityRole="header">Bielefeld</T>
          <T variant="small" color="asphalt" style={{ flex: 1 }}>{status}</T>
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

      {mode === 'map' && sel ? (
        <BlurView intensity={85} tint={dark ? 'dark' : 'light'} style={st.sheet}>
          <Pressable onPress={() => router.push(`/spot/${sel.id}`)} style={st.sheetInner} accessibilityRole="button" accessibilityLabel={`${sel.name} ansehen`}>
            <Image source={sel.images[0]} style={st.sheetImg} contentFit="cover" />
            <View style={{ flex: 1, gap: space.xs }}>
              <SpotSign name={sel.name} distance={fmtDist(sel.dist)} />
              <T variant="small" color="asphalt">{sel.area}, {sel.likes.toLocaleString('de-DE')} Likes</T>
            </View>
            <Ionicons name="chevron-forward" size={22} color={c.asphalt} />
          </Pressable>
        </BlurView>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  seg: { flexDirection: 'row', padding: 3, borderRadius: radius.pill },
  segBtn: { width: hit, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  pin: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, overflow: 'hidden', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  pinActive: { width: 60, height: 60, borderRadius: 30 },
  pinImg: { width: '100%', height: '100%' },
  pinDot: { position: 'absolute', right: 2, bottom: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  pinTip: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
  fab: { position: 'absolute', right: space.md + 2, width: hit, height: hit, borderRadius: radius.thumb, overflow: 'hidden' },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheet: { position: 'absolute', left: space.md, right: space.md, bottom: space.md, borderRadius: radius.card, overflow: 'hidden' },
  sheetInner: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm + 2 },
  sheetImg: { width: 76, height: 95, borderRadius: radius.thumb },
  empty: { padding: space.xl, gap: space.sm },
});
