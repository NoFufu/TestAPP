import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/auth';
import { sendFeedback } from '../src/lib/events';
import { Button, IconButton, T, haptic, radius, space, type, useColors } from '../src/ui';

/** Feedback aus der Testphase: Freitext, geht an die Admins. */
export default function Feedback() {
  const c = useColors();
  const { session } = useAuth();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!session || !msg.trim()) return;
    setBusy(true); setError(null);
    try { await sendFeedback(session.user.id, msg); haptic.like(); setDone(true); }
    catch { setError('Senden hat nicht geklappt. Prüfe dein Internet.'); }
    setBusy(false);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header">Feedback</T>
      </View>
      {done ? (
        <View style={[st.pad, { gap: space.lg }]}>
          <T>Danke! Jede Rückmeldung hilft uns, fitspot besser zu machen.</T>
          <Button label="Fertig" onPress={() => router.back()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[st.pad, { gap: space.lg }]} keyboardShouldPersistTaps="handled">
          <T color="asphalt">Was gefällt dir, was nervt, was fehlt? Fehler gern mit kurzer Beschreibung, wo sie passiert sind.</T>
          <TextInput value={msg} onChangeText={setMsg} maxLength={2000} multiline autoFocus accessibilityLabel="Dein Feedback"
            style={[type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }]} />
          {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
          <Button label="Senden" icon="send" onPress={send} loading={busy} disabled={!msg.trim() || busy || !session} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  pad: { padding: space.lg },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md, paddingVertical: space.md, minHeight: 160, textAlignVertical: 'top' },
});
