import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SunCalc from 'suncalc';
import { catInfo, fmtDist, TIPS } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { Button, Chip, IconButton, PhotoGrid, SpotSign, T, radius, space, useColors } from '../../src/ui';

const hhmm = (d: Date) => (isNaN(d.getTime()) ? '–' : d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));

export default function SpotDetail() {
  usePreventScreenCapture();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spots, saved, toggleSave } = useStore();
  const [page, setPage] = useState(0);
  const s = spots.find((x) => String(x.id) === id);

  const light = useMemo(() => {
    if (!s) return null;
    const now = new Date();
    const t = SunCalc.getTimes(now, s.lat, s.lon);
    return { golden: hhmm(t.goldenHour), sunset: hhmm(t.sunset), over: now > t.sunset };
  }, [s]);

  if (!s) {
    return (
      <View style={[st.center, { backgroundColor: c.paper }]}>
        <T>Diesen Spot gibt es nicht mehr.</T>
        <Button label="Zurück" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const tip = TIPS[s.cats[0]];
  const isSaved = saved.has(s.id);
  const captions = s.user ? ['Dein Upload'] : ['Der Spot', 'Outfit-Beispiel'];

  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }}>
        <View>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {s.images.map((img, i) => (
              <Image key={i} source={img} accessibilityLabel={`${s.name}: ${captions[i] ?? 'Foto'}`}
                style={{ width, height: width * 1.25, backgroundColor: c.fill }} contentFit="cover" />
            ))}
          </ScrollView>
          <SpotSign name={s.area} distance={fmtDist(s.dist)} style={st.sign} />
          {s.images.length > 1 ? (
            <View style={st.dots} accessibilityLabel={`Foto ${page + 1} von ${s.images.length}`}>
              {s.images.map((_, i) => (
                <View key={i} style={[st.dot, { backgroundColor: c.onPhoto, opacity: i === page ? 1 : 0.5 }]} />
              ))}
            </View>
          ) : null}
          <IconButton icon="close" label="Schließen" color={c.onPhoto} size={22} onPress={() => router.back()}
            style={[st.close, { top: space.md, backgroundColor: c.photoScrim }]} />
        </View>

        <View style={st.body}>
          <T variant="display" accessibilityRole="header">{s.name}</T>
          <T variant="small" color="asphalt">{captions[page]}. {s.likes.toLocaleString('de-DE')} Likes</T>
          <View style={st.row}>
            {s.cats.map((k) => <Chip key={k} label={catInfo(k).label} dot={catInfo(k).color} />)}
          </View>
          <T>{s.desc}</T>

          {light ? (
            <View style={st.row}>
              <View style={[st.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
                <T variant="small" color="asphalt">Golden Hour heute</T>
                <T variant="stat">{light.over ? 'vorbei' : `ab ${light.golden}`}</T>
              </View>
              <View style={[st.tile, { backgroundColor: c.surface, borderColor: c.line }]}>
                <T variant="small" color="asphalt">Sonnenuntergang</T>
                <T variant="stat">{light.sunset}</T>
              </View>
            </View>
          ) : null}

          <View style={[st.tipBox, { borderColor: c.line }]}>
            <T variant="label">Foto-Tipp</T>
            <T color="asphalt">{tip.tip}. Am besten: {tip.best}.</T>
          </View>

          <View style={st.row}>
            <Button label="Route" icon="navigate" style={{ flex: 1 }}
              onPress={() => Linking.openURL(Platform.OS === 'ios'
                ? `https://maps.apple.com/?daddr=${s.lat},${s.lon}&dirflg=w`
                : `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}&travelmode=walking`)} />
            <Button label={isSaved ? 'Gemerkt' : 'Merken'} icon={isSaved ? 'bookmark' : 'bookmark-outline'} variant="secondary"
              style={{ flex: 1 }} onPress={() => toggleSave(s.id)} />
          </View>
        </View>

        {!s.user && s.images[1] ? (
          <View style={{ gap: space.sm }}>
            <T variant="name" style={{ paddingHorizontal: space.lg }}>Outfits an diesem Spot</T>
            <PhotoGrid items={[{ key: 'o1', photo: s.images[1], label: 'Outfit-Beispiel', onPress: () => setPage(1) }]} />
            <T variant="small" color="asphalt" style={{ paddingHorizontal: space.lg }}>
              Hier erscheinen bald die Outfit-Fotos aus der Community.
            </T>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl },
  sign: { position: 'absolute', left: space.md, bottom: space.md },
  dots: { position: 'absolute', bottom: space.lg, right: space.md, flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  close: { position: 'absolute', right: space.sm, borderRadius: radius.pill },
  body: { padding: space.lg, gap: space.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: { flex: 1, minWidth: 140, gap: 2, padding: space.md, borderRadius: radius.thumb + 2, borderWidth: StyleSheet.hairlineWidth },
  tipBox: { gap: space.xs, padding: space.md, borderRadius: radius.thumb + 2, borderWidth: StyleSheet.hairlineWidth },
});
