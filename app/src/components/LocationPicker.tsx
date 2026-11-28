import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { Button, IconButton, T, hit, locationPin, mapZoom, radius, space, type, useColors, useIsDark } from '../ui';

type Pos = { lat: number; lon: number };

/** Ort wählen: Karte schieben, der Pin in der Mitte bleibt stehen. Suche nach Adresse oder Ort, „Mein Standort“. */
export function LocationPicker({ visible, start, onClose, onPick }: { visible: boolean; start: Pos; onClose: () => void; onPick: (p: Pos) => void }) {
  const c = useColors();
  const dark = useIsDark();
  const { me, realLocation, locate } = useStore();
  const map = useRef<MapView>(null);
  const [center, setCenter] = useState<Pos>(start);
  const [q, setQ] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const fly = (p: Pos, d = mapZoom.single) => map.current?.animateToRegion({ latitude: p.lat, longitude: p.lon, latitudeDelta: d, longitudeDelta: d }, 450);

  async function search() {
    const text = q.trim();
    if (!text) return;
    setNote(null);
    try {
      const hit1 = (await Location.geocodeAsync(text))[0];
      if (hit1) fly({ lat: hit1.latitude, lon: hit1.longitude }); else setNote('Dazu habe ich keinen Ort gefunden.');
    } catch { setNote('Die Suche geht gerade nicht. Schieb die Karte stattdessen von Hand.'); }
  }
  async function toMe() {
    const here = realLocation ? me : await locate();
    if (here) fly(here); else setNote('Ohne Standort-Erlaubnis geht das nicht. Such den Ort oder schieb die Karte.');
  }
  async function settled(p: Pos) {
    setCenter(p);
    try {
      const a = (await Location.reverseGeocodeAsync({ latitude: p.lat, longitude: p.lon }))[0];
      setAddress(a ? [[a.street, a.streetNumber].filter(Boolean).join(' '), a.district ?? a.city].filter(Boolean).join(', ') || null : null);
    } catch { setAddress(null); }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.paper }}>
        <MapView ref={map} style={StyleSheet.absoluteFill} userInterfaceStyle={dark ? 'dark' : 'light'} showsUserLocation showsPointsOfInterests={false}
          showsCompass={false} accessibilityLabel="Karte zum Wählen des Ortes"
          initialRegion={{ latitude: start.lat, longitude: start.lon, latitudeDelta: mapZoom.single, longitudeDelta: mapZoom.single }}
          onRegionChangeComplete={(r) => settled({ lat: r.latitude, lon: r.longitude })} />
        {/* Pin bleibt in der Mitte, die Spitze zeigt auf den gewählten Punkt */}
        <View pointerEvents="none" style={st.pinWrap}>
          <Ionicons name="location-sharp" size={locationPin.size} color={c.ink} style={{ marginTop: -locationPin.size }} />
        </View>

        <SafeAreaView edges={['top']} pointerEvents="box-none" style={st.top}>
          <View style={st.bar}>
            <IconButton icon="chevron-down" label="Schließen" filled onPress={onClose} />
            <View style={[st.field, { backgroundColor: c.surface, borderColor: c.line }]}>
              <Ionicons name="search" size={18} color={c.asphalt} />
              <TextInput value={q} onChangeText={setQ} onSubmitEditing={search} placeholder="Adresse oder Ort suchen" placeholderTextColor={c.asphalt}
                returnKeyType="search" autoCorrect={false} accessibilityLabel="Adresse oder Ort suchen" style={[type.body, st.input, { color: c.ink }]} />
            </View>
          </View>
          {note ? <T variant="small" style={[st.note, { backgroundColor: c.surface, color: c.ink }]} accessibilityLiveRegion="polite">{note}</T> : null}
        </SafeAreaView>

        <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={st.bottom}>
          <IconButton icon="navigate" label="Zu meinem Standort" filled onPress={toMe} style={{ alignSelf: 'flex-end' }} />
          <View style={[st.sheet, { backgroundColor: c.surface, borderColor: c.line }]}>
            <T variant="small" color="asphalt">Schieb die Karte, bis der Pin auf dem Spot steht.</T>
            <T variant="name" numberOfLines={1}>{address ?? `${center.lat.toFixed(5)}, ${center.lon.toFixed(5)}`}</T>
            <Button label="Diesen Ort wählen" icon="checkmark" onPress={() => onPick(center)} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  pinWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, gap: space.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: hit, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.md },
  input: { flex: 1, paddingVertical: space.sm },
  note: { alignSelf: 'center', paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, overflow: 'hidden' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.md, gap: space.sm },
  sheet: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, gap: space.sm },
});
