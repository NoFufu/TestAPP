import { router } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { Button, PhotoGrid, T, radius, space, useColors, useIsDark, dock } from '../../src/ui';

/** Shoots: gemerkte Spots. Später: eigene Shoot-Listen mit Route (Etappe G). */
export default function Shoots() {
  const c = useColors();
  const { spots, saved } = useStore();
  const dark = useIsDark();
  const { width } = useWindowDimensions();
  const map = useRef<MapView>(null);
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
            <T variant="name" accessibilityRole="header">Auf der Karte</T>
            <MapView
              ref={map}
              style={{ width: width - space.lg * 2, height: width - space.lg * 2, borderRadius: radius.card }}
              initialRegion={{ latitude: list[0].lat, longitude: list[0].lon, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
              onMapReady={() => map.current?.fitToCoordinates(list.map((s) => ({ latitude: s.lat, longitude: s.lon })),
                { edgePadding: { top: space.xxl * 2, bottom: space.xxl, left: space.xxl, right: space.xxl }, animated: false })}
              showsUserLocation
              showsPointsOfInterests={false}
              userInterfaceStyle={dark ? 'dark' : 'light'}
              accessibilityLabel="Karte mit deinen gemerkten Spots"
            >
              {list.map((s) => (
                <Marker key={s.id} coordinate={{ latitude: s.lat, longitude: s.lon }} pinColor={c.cherry}
                  title={s.name} description={`${fmtDist(s.dist)} · antippen zum Öffnen`}
                  onCalloutPress={() => router.push(`/spot/${s.id}`)} />
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
  mapWrap: { padding: space.lg, gap: space.sm },
  empty: { paddingHorizontal: space.lg, gap: space.lg, alignItems: 'flex-start' },
});
