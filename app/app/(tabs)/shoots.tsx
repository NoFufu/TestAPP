import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { catInfo, fmtDist } from '../../src/data/spots';
import { useAuth } from '../../src/lib/auth';
import { loadLists, type ShootList } from '../../src/lib/lists';
import { useStore } from '../../src/store';
import { Image } from 'expo-image';
import { Button, GlowPress, PhotoGrid, PhotoPin, T, radius, space, thumbSize, useColors, useIsDark, dock } from '../../src/ui';

/** Shoots: gemerkte Spots. Später: eigene Shoot-Listen mit Route (Etappe G). */
export default function Shoots() {
  const c = useColors();
  const { spots, saved, city } = useStore();
  const { session } = useAuth();
  const [lists, setLists] = useState<ShootList[]>([]);
  useFocusEffect(useCallback(() => { if (session) loadLists().then(setLists, () => {}); else setLists([]); }, [session]));
  const dark = useIsDark();
  // Karte nur für eine Stadt, sonst wird sie zur Europakarte mit winzigen Punkten.
  const onMap = (() => { const l = spots.filter((s) => saved.has(s.id)); const here = l.filter((s) => (s.city ?? 'Bielefeld') === city); return here.length ? here : l.filter((s) => (s.city ?? 'Bielefeld') === (l[0]?.city ?? 'Bielefeld')); })();
  const { width } = useWindowDimensions();
  const map = useRef<MapView>(null);
  // Fotos laden kurz nach, danach Markierungen einfrieren (schneller).
  const [livePins, setLivePins] = useState(true);
  useEffect(() => { setLivePins(true); const t = setTimeout(() => setLivePins(false), 1500); return () => clearTimeout(t); }, [saved]);
  const list = spots.filter((s) => saved.has(s.id)).sort((a, b) => a.dist - b.dist);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: dock.clearance }}>
        <View style={st.head}>
          <T variant="title" accessibilityRole="header">Shoots</T>
          <T color="asphalt">
            {list.length ? `${list.length} gemerkte ${list.length === 1 ? 'Spot' : 'Spots'}, nach Entfernung sortiert.` : 'Hier sammelst du Spots für deinen nächsten Shoot.'}
          </T>
        </View>
        <View style={st.lists}>
          <View style={st.listsHead}>
            <T variant="name" accessibilityRole="header" style={{ flex: 1 }}>Meine Listen</T>
            {session ? null : <Button label="Anmelden" variant="secondary" onPress={() => router.push('/login')} />}
          </View>
          {session && !lists.length ? (
            <T variant="small" color="asphalt">Plane einen Shoot: Auf einer Spot-Seite tippst du auf das Listen-Symbol und legst eine Liste an.</T>
          ) : null}
          {!session ? <T variant="small" color="asphalt">Mit Konto kannst du Shoot-Listen anlegen, eine Route planen und sie teilen.</T> : null}
          {lists.map((l) => {
            const first = spots.find((s) => s.id === l.spotIds[0]);
            return (
              <GlowPress key={l.id} rounded={radius.card} onPress={() => router.push(`/list/${l.id}`)} accessibilityRole="button"
                accessibilityLabel={`Liste ${l.name}, ${l.spotIds.length} Spots`} style={[st.listCard, { backgroundColor: c.surface }]}>
                {first ? <Image source={first.images[0]} style={st.listThumb} contentFit="cover" /> : <View style={[st.listThumb, { backgroundColor: c.fill }]} />}
                <View style={{ flex: 1 }}>
                  <T variant="label" numberOfLines={1}>{l.name}</T>
                  <T variant="small" color="asphalt">{l.spotIds.length} {l.spotIds.length === 1 ? 'Spot' : 'Spots'}</T>
                </View>
              </GlowPress>
            );
          })}
        </View>
        <T variant="name" accessibilityRole="header" style={st.savedHead}>Gemerkt</T>
        {list.length ? (
          <PhotoGrid
            items={list.map((s) => ({
              key: String(s.id), photo: s.images[0], label: `${s.name}, ${fmtDist(s.dist)}`,
              onPress: () => router.push(`/spot/${s.id}`),
            }))}
          />
        ) : null}
        {list.length ? (
          <View style={st.mapWrap}>
            <T variant="name" accessibilityRole="header">Auf der Karte · {onMap[0]?.city ?? 'Bielefeld'}</T>
            <MapView
              ref={map}
              style={{ width: width - space.lg * 2, height: width - space.lg * 2, borderRadius: radius.card }}
              initialRegion={{ latitude: onMap[0].lat, longitude: onMap[0].lon, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
              onMapReady={() => map.current?.fitToCoordinates(onMap.map((s) => ({ latitude: s.lat, longitude: s.lon })),
                { edgePadding: { top: space.xxl * 2, bottom: space.xxl, left: space.xxl, right: space.xxl }, animated: false })}
              showsUserLocation
              showsPointsOfInterests={false}
              userInterfaceStyle={dark ? 'dark' : 'light'}
              accessibilityLabel="Karte mit deinen gemerkten Spots"
            >
              {onMap.map((s) => (
                <Marker key={s.id} coordinate={{ latitude: s.lat, longitude: s.lon }} anchor={{ x: 0.5, y: 1 }}
                  tracksViewChanges={livePins} accessibilityLabel={s.name}
                  onPress={() => router.push(`/spot/${s.id}`)}>
                  <PhotoPin photo={s.images[0]} dot={catInfo(s.cats[0]).color} icon={catInfo(s.cats[0]).icon} />
                </Marker>
              ))}
            </MapView>
          </View>
        ) : (
          <View style={st.empty}>
            <T color="asphalt">Tippe im Feed oder auf einer Spot-Seite auf das Lesezeichen, dann landet der Spot hier.</T>
            <Button label="Spots entdecken" icon="search" onPress={() => router.navigate('/explore')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { padding: space.lg, gap: space.xs },
  lists: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.sm },
  listsHead: { flexDirection: 'row', alignItems: 'center' },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm },
  listThumb: { width: thumbSize, height: thumbSize, borderRadius: radius.thumb },
  savedHead: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  mapWrap: { padding: space.lg, gap: space.sm },
  empty: { paddingHorizontal: space.lg, gap: space.lg, alignItems: 'flex-start' },
});
