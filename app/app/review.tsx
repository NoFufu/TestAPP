import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPOT_IMAGES } from '../src/data/images';
import { photoUrl } from '../src/lib/supabase';
import { REPORT_REASONS, loadQueue, moderate, type QueueItem } from '../src/lib/upload';
import { loadFeedback, loadStats, type TestStats } from '../src/lib/events';
import { useStore } from '../src/store';
import { Button, IconButton, StatusBadge, T, radius, space, thumbSize, useColors } from '../src/ui';

const reasonLabel = (k: string) => REPORT_REASONS.find((r) => r.key === k)?.label ?? k;

/** Prüfen (nur Admins): Gemeldetes, Ausgeblendetes, GPS weit weg, doppelte Fotos. Freigeben oder ablehnen. */
export default function Review() {
  const c = useColors();
  const { reload } = useStore();
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [fb, setFb] = useState<Awaited<ReturnType<typeof loadFeedback>>>([]);
  useFocusEffect(useCallback(() => { loadStats().then(setStats); loadFeedback().then(setFb); }, []));

  const load = useCallback(() => {
    loadQueue().then((x) => { setItems(x); setError(null); }, () => setError('Konnte die Liste nicht laden.'));
  }, []);
  useFocusEffect(load);

  async function act(it: QueueItem, action: 'approve' | 'reject') {
    const key = `${it.kind}-${it.id}`;
    setBusy(key);
    try { await moderate(it.kind, it.id, action); load(); reload(); }
    catch { Alert.alert('Ging nicht', 'Bitte noch mal versuchen.'); }
    setBusy(null);
  }
  function askReject(it: QueueItem) {
    Alert.alert(it.kind === 'spot' ? 'Spot ablehnen?' : 'Foto ablehnen?', `„${it.name}" wird für alle ausgeblendet.`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Ablehnen', style: 'destructive', onPress: () => act(it, 'reject') },
    ]);
  }

  const thumb = { width: thumbSize, height: thumbSize, borderRadius: radius.thumb, backgroundColor: c.fill };
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header">Prüfen</T>
      </View>
      <ScrollView contentContainerStyle={st.body}>
        {stats ? (
          <View style={[st.card, { borderColor: c.line }]}>
            <T variant="name" accessibilityRole="header">Testphase</T>
            <T variant="small">{stats.testers} Tester · {stats.feedback_count} Feedbacks</T>
            {[
              ['Spot gemerkt', stats.saved_pct, 60], ['Route geöffnet', stats.route_pct, 30],
              ['Selbst hochgeladen', stats.upload_pct, 15], ['Nach 1 Woche wieder da', stats.returned_pct, 25],
            ].map(([l, v, goal]) => (
              <T key={l as string} variant="small" color={(v as number) >= (goal as number) ? 'ink' : 'asphalt'}>
                {(v as number) >= (goal as number) ? '✓' : '·'} {l}: {v} % (Ziel {goal} %)
              </T>
            ))}
          </View>
        ) : null}
        {fb.length ? (
          <View style={[st.card, { borderColor: c.line }]}>
            <T variant="name" accessibilityRole="header">Feedback</T>
            {fb.slice(0, 30).map((f, i) => (
              <View key={i} style={{ gap: 2 }}>
                <T variant="small" color="asphalt">{f.username ?? 'unbekannt'} · {new Date(f.created_at).toLocaleDateString('de-DE')} · v{f.app_version}</T>
                <T>{f.message}</T>
              </View>
            ))}
          </View>
        ) : null}
        <T variant="name" accessibilityRole="header">Zu prüfen</T>
        {error ? <T color="danger">{error}</T> : null}
        {items?.length === 0 ? <T color="asphalt">Nichts zu prüfen. Alles sauber.</T> : null}
        {items?.map((it) => {
          const src = it.storage_path ? { uri: photoUrl(it.storage_path) } : SPOT_IMAGES[it.spot_id]?.[0];
          const flags = [
            it.open_reports ? `${it.open_reports} ${it.open_reports === 1 ? 'Meldung' : 'Meldungen'}: ${it.reasons.map(reasonLabel).join(', ')}` : null,
            it.gps_distance_m != null && it.gps_distance_m > 300 ? `Foto ${it.gps_distance_m} m vom Spot entfernt aufgenommen` : null,
            it.duplicate ? 'Gleiches Foto gibt es schon einmal' : null,
          ].filter(Boolean) as string[];
          const key = `${it.kind}-${it.id}`;
          return (
            <View key={key} style={[st.card, { borderColor: c.line }]}>
              <View style={st.row}>
                {src ? <Image source={src} style={thumb} contentFit="cover" /> : <View style={thumb} />}
                <View style={st.grow}>
                  <T variant="label" numberOfLines={1}>{it.kind === 'spot' ? 'Spot' : 'Foto'} · {it.name}</T>
                  <StatusBadge status={it.status} />
                </View>
                <IconButton icon="open-outline" label="Spot ansehen" onPress={() => router.push(`/spot/${it.spot_id}`)} />
              </View>
              {flags.map((f) => <T key={f} variant="small">{f}</T>)}
              {it.notes.map((n, i) => <T key={i} variant="small" color="asphalt">„{n}"</T>)}
              <View style={st.row}>
                <Button label="Freigeben" icon="checkmark" style={st.grow} loading={busy === key} disabled={!!busy} onPress={() => act(it, 'approve')} />
                <Button label="Ablehnen" variant="secondary" style={st.grow} disabled={!!busy} onPress={() => askReject(it)} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  body: { padding: space.lg, gap: space.md },
  card: { gap: space.sm, paddingBottom: space.md, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1, gap: space.xs },
});
