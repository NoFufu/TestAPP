import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import SunCalc from 'suncalc';
import { catInfo, distanceKm, fmtDist, type SpotImage } from '../../src/data/spots';
import { useAuth } from '../../src/lib/auth';
import { loadSpotPhotos, type SpotPhoto } from '../../src/lib/upload';
import { useStore } from '../../src/store';
import { Button, IconButton, Masonry, SunArc, T, grid, pinRatio, radius, space, useColors, type Pin } from '../../src/ui';

type Shot = { key: string; src: SpotImage; label: string };

/** Spot groß: Foto oben, Infos, darunter alle Fotos an diesem Spot und ähnliche Spots. */
export default function SpotDetail() {
  usePreventScreenCapture();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const { id, photo } = useLocalSearchParams<{ id: string; photo?: string }>();
  const { spots, saved, toggleSave } = useStore();
  const { session } = useAuth();
  const s = spots.find((x) => String(x.id) === id);
  const [remote, setRemote] = useState<SpotPhoto[]>([]);
  const [bigKey, setBigKey] = useState<string>(`own-${photo ?? '0'}`);
  const [showInsta, setShowInsta] = useState<Set<string>>(new Set());

  // Fotos neu laden, wenn man zurückkommt (z. B. nach „Foto hinzufügen")
  useFocusEffect(useCallback(() => {
    if (s && !s.user) loadSpotPhotos(s.id).then(setRemote);
  }, [s]));

  const light = useMemo(() => {
    if (!s) return null;
    const now = new Date();
    const t = SunCalc.getTimes(now, s.lat, s.lon);
    return { sunrise: t.sunrise, sunset: t.sunset, golden: t.goldenHour, now };
  }, [s]);

  const shots = useMemo<Shot[]>(() => {
    if (!s) return [];
    const own = s.images.map((src, k) => ({ key: `own-${k}`, src, label: k ? 'Mit Person' : 'Der Spot' }));
    const ownUrls = new Set(own.map((o) => (typeof o.src === 'number' ? '' : o.src.uri)));
    const extra = remote
      .filter((r) => r.url && !ownUrls.has(r.url))
      .map((r) => ({ key: `r-${r.id}`, src: { uri: r.url! }, label: r.by ? `Foto von ${r.by}` : 'Foto' }));
    return [...own, ...extra];
  }, [s, remote]);

  const similar = useMemo(() => {
    if (!s) return [];
    return spots
      .filter((x) => x.id !== s.id && x.cats.some((k) => s.cats.includes(k)))
      .map((x) => ({ x, d: distanceKm(s, x) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 12);
  }, [s, spots]);

  if (!s) {
    return (
      <View style={[st.center, { backgroundColor: c.paper }]}>
        <T>Diesen Spot gibt es nicht mehr.</T>
        <Button label="Zurück" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const big = shots.find((x) => x.key === bigKey) ?? shots[0];
  const isSaved = saved.has(s.id);
  const instaLinks = [...new Set([s.instagramUrl, ...remote.map((r) => r.instagram_url)].filter((u): u is string => !!u))];

  const morePins: Pin[] = shots.filter((x) => x.key !== big?.key).map((x, i) => ({
    key: x.key, photo: x.src, ratio: pinRatio(s.id + i), label: `${x.label}. Groß anzeigen`,
    onPress: () => { setBigKey(x.key); scroll.current?.scrollTo({ y: 0, animated: true }); },
  }));
  const similarPins: Pin[] = similar.map(({ x, d }) => ({
    key: `sim-${x.id}`, photo: x.images[0], ratio: pinRatio(x.id), title: x.name, subtitle: `${fmtDist(d)} von hier`,
    label: `${x.name}, ${fmtDist(d)} von hier. Öffnen`, saved: saved.has(x.id),
    onPress: () => router.push({ pathname: '/spot/[id]', params: { id: String(x.id) } }),
    onSave: () => toggleSave(x.id),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }}>
        <View style={st.hero}>
          {big ? (
            <Image source={big.src} accessibilityLabel={`${s.name}: ${big.label}`}
              style={{ width: width - grid.edge * 2, height: (width - grid.edge * 2) * 1.3, backgroundColor: c.fill, borderRadius: grid.radius * 2 }}
              contentFit="cover" transition={150} />
          ) : null}
          <IconButton icon="chevron-down" label="Schließen" color={c.onPhoto} size={24} onPress={() => router.back()}
            style={[st.close, { backgroundColor: c.photoScrim }]} />
        </View>

        <View style={st.actions}>
          <IconButton icon="navigate-outline" label="Route zum Spot" onPress={() => Linking.openURL(Platform.OS === 'ios'
            ? `https://maps.apple.com/?daddr=${s.lat},${s.lon}&dirflg=w`
            : `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}&travelmode=walking`)} />
          {!s.user ? (
            <IconButton icon="camera-outline" label="Eigenes Foto hinzufügen"
              onPress={() => session ? router.push({ pathname: '/add-photo', params: { spot: String(s.id) } }) : router.push('/login')} />
          ) : null}
          <View style={{ flex: 1 }} />
          <Button label={isSaved ? 'Gemerkt' : 'Merken'} icon={isSaved ? 'bookmark' : 'bookmark-outline'}
            variant={isSaved ? 'secondary' : 'primary'} onPress={() => toggleSave(s.id)} />
        </View>

        <View style={st.body}>
          <T variant="title" accessibilityRole="header">{s.name}</T>
          <T variant="small" color="asphalt">{s.area || 'Bielefeld'} · {fmtDist(s.dist)} · {s.cats.map((k) => catInfo(k).label).join(', ')}</T>
          {s.desc ? <T numberOfLines={2}>{s.desc}</T> : null}
          {light ? (
            <SunArc sunrise={light.sunrise} sunset={light.sunset} golden={light.golden} now={light.now} />
          ) : null}
        </View>

        {morePins.length ? (
          <View style={st.section}>
            <T variant="name" accessibilityRole="header" style={st.head}>Fotos hier</T>
            <Masonry pins={morePins} />
          </View>
        ) : null}

        {instaLinks.length ? (
          <View style={[st.section, st.pad]}>
            <T variant="title" accessibilityRole="header">Auf Instagram</T>
            {instaLinks.map((url) => showInsta.has(url) ? (
              <WebView key={url} source={{ uri: `${url}embed/` }} scrollEnabled={false}
                style={{ height: Math.round(width * 1.45), backgroundColor: c.surface }} accessibilityLabel="Eingebetteter Instagram-Post" />
            ) : (
              <View key={url} style={[st.instaTile, { backgroundColor: c.surface, borderColor: c.line }]}>
                <T variant="small" color="asphalt">Lädt Inhalte von Instagram (Meta).</T>
                <Button label="Instagram-Post laden" icon="logo-instagram" variant="secondary"
                  onPress={() => setShowInsta((p) => new Set(p).add(url))} />
              </View>
            ))}
          </View>
        ) : null}

        {similarPins.length ? (
          <View style={st.section}>
            <T variant="name" accessibilityRole="header" style={st.head}>Mehr wie das</T>
            <Masonry pins={similarPins} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl },
  hero: { paddingHorizontal: grid.edge, paddingTop: grid.edge },
  close: { position: 'absolute', top: space.lg, left: space.lg, borderRadius: radius.pill },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm, paddingTop: space.sm },
  body: { paddingHorizontal: space.lg, gap: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  section: { gap: space.sm, paddingTop: space.xl },
  pad: { paddingHorizontal: space.lg },
  head: { textAlign: 'center' },
  instaTile: { gap: space.md, padding: space.md, borderRadius: radius.thumb + 2, borderWidth: StyleSheet.hairlineWidth },
});
