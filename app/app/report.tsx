import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/auth';
import { REPORT_REASONS, sendReport, type ReportReason } from '../src/lib/upload';
import { Button, Chip, IconButton, T, haptic, radius, space, type, useColors } from '../src/ui';

/** Spot oder Foto melden. Ab 3 Meldungen von verschiedenen Leuten wird der Inhalt ausgeblendet. */
export default function Report() {
  const c = useColors();
  const { spot, photo, name } = useLocalSearchParams<{ spot?: string; photo?: string; name?: string }>();
  const { session } = useAuth();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!session || !reason) return;
    setBusy(true); setError(null);
    try {
      await sendReport(session.user.id, { spotId: spot ? Number(spot) : undefined, photoId: photo ? Number(photo) : undefined }, reason, note);
      haptic.select(); setDone(true);
    } catch {
      setError('Melden hat nicht geklappt. Prüfe dein Internet und versuch es noch mal.');
    }
    setBusy(false);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header">{photo ? 'Foto melden' : 'Spot melden'}</T>
      </View>
      {done ? (
        <View style={[st.pad, { gap: space.lg }]}>
          <T>Danke! Wir schauen uns das an.</T>
          <Button label="Fertig" onPress={() => router.back()} />
        </View>
      ) : !session ? (
        <View style={[st.pad, { gap: space.lg }]}>
          <T color="asphalt">Zum Melden musst du angemeldet sein.</T>
          <Button label="Anmelden" onPress={() => router.replace('/login')} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[st.pad, { gap: space.lg }]} keyboardShouldPersistTaps="handled">
          {name ? <T color="asphalt">„{name}"</T> : null}
          <View style={{ gap: space.sm }}>
            <T variant="label">Was stimmt nicht?</T>
            <View style={st.chips}>
              {REPORT_REASONS.map((r) => (
                <Chip key={r.key} label={r.label} selected={reason === r.key} onPress={() => setReason(r.key)} />
              ))}
            </View>
          </View>
          <View style={{ gap: space.sm }}>
            <T variant="label">Noch etwas dazu? (optional)</T>
            <TextInput value={note} onChangeText={setNote} maxLength={300} multiline accessibilityLabel="Bemerkung"
              style={[type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]} />
          </View>
          {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
          <Button label="Melden" onPress={send} loading={busy} disabled={!reason || busy} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  pad: { padding: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md, paddingVertical: space.md, minHeight: 72, textAlignVertical: 'top' },
});
