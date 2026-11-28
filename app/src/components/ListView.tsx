import { router } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { catInfo, fmtDist, type Spot } from '../data/spots';
import { PhotoGrid, PhotoPin, T, radius, space, useIsDark } from '../ui';

/** Spots einer Liste: Raster + Karte. Gemeinsam für eigene und geteilte Listen. */
export function ListSpots({ spots }: { spots: (Spot & { dist: number })[] }) {
  const dark = useIsDark();
  const { width } = useWindowDimensions();
  const map = useRef<MapView>(null);
  if (!spots.length) return <T color="asphalt" style={st.pad}>Noch keine Spots in dieser Liste. Füge sie auf einer Spot-Seite hinzu.</T>;
  const city = spots[0].city ?? 'Bielefeld';
  const onMap = spots.filter((s) => (s.city ?? 'Bielefeld') === city);
  return (
    <View style={{ gap: space.lg }}>
      <PhotoGrid items={spots.map((s) => ({
        key: String(s.id), photo: s.images[0], label: `${s.name}, ${fmtDist(s.dist)}`,
        onPress: () => router.push(`/spot/${s.id}`),
      }))} />
      <View style={st.pad}>
        <MapView ref={map}
          style={{ width: width - space.lg * 2, height: (width - space.lg * 2) * 0.8, borderRadius: radius.card }}
          initialRegion={{ latitude: onMap[0].lat, longitude: onMap[0].lon, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          onMapReady={() => map.current?.fitToCoordinates(onMap.map((s) => ({ latitude: s.lat, longitude: s.lon })),
            { edgePadding: { top: space.xxl * 2, bottom: space.xxl, left: space.xxl, right: space.xxl }, animated: false })}
          showsUserLocation showsPointsOfInterests={false} userInterfaceStyle={dark ? 'dark' : 'light'}
          accessibilityLabel="Karte mit den Spots der Liste">
          {onMap.map((s) => (
            <Marker key={s.id} coordinate={{ latitude: s.lat, longitude: s.lon }} anchor={{ x: 0.5, y: 1 }}
              accessibilityLabel={s.name} onPress={() => router.push(`/spot/${s.id}`)}>
              <PhotoPin photo={s.images[0]} dot={catInfo(s.cats[0]).color} icon={catInfo(s.cats[0]).icon} />
            </Marker>
          ))}
        </MapView>
      </View>
    </View>
  );
}

const st = StyleSheet.create({ pad: { paddingHorizontal: space.lg } });
