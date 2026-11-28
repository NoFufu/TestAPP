import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/auth';
import { loadFriendships, loadMembers, sendMessage, type Member } from '../src/lib/social';
import { useStore } from '../src/store';
import { Avatar, Button, Chip, IconButton, T, haptic, hit, radius, space, useColors } from '../src/ui';

const QUICK = ['Treffen wir uns hier?', 'Schau mal, der Spot!', 'Da müssen wir hin.'];

/** Spot an einen Freund schicken: Freund wählen, optional kurzer Text, fertig. */
export default function SendSpot() {
  const c = useColors();
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const { session } = useAuth();
  const me = session?.user.id;
  const { spots } = useStore();
  const spot = spots.find((s) => String(s.id) === spotId);
  const [friends, setFriends] = useState<Member[] | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    Promise.all([loadMembers(me), loadFriendships()]).then(([m, f]) => {
      const ids = new Set(f.filter((x) => x.status === 'accepted').map((x) => (x.requester === me ? x.addressee : x.requester)));
      setFriends(m.filter((x) => ids.has(x.id)));
    }, () => { setFriends([]); setError('Das Laden hat nicht geklappt.'); });
  }, [me]);

  async function send(to: Member) {
    if (!me || !spot) return;
    setBusy(to.id); setError(null);
    try {
      await sendMessage(me, to.id, text, spot.id);
      haptic.like();
      router.replace(`/chat/${to.id}`);
    } catch { setError('Senden hat nicht geklappt. Versuch es noch mal.'); setBusy(null); }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="title" accessibilityRole="header" numberOfLines={1} style={{ flex: 1 }}>Spot schicken</T>
      </View>
      <ScrollView contentContainerStyle={st.page}>
        <T color="asphalt">{spot ? `„${spot.name}“ an einen Freund schicken.` : 'Dieser Spot ist nicht mehr verfügbar.'}</T>
        <View style={st.quick}>
          {QUICK.map((q) => <Chip key={q} label={q} selected={text === q} onPress={() => setText(text === q ? '' : q)} />)}
        </View>
        {!me ? <Button label="Anmelden" onPress={() => router.push('/login')} /> : null}
        {friends && !friends.length ? (
          <View style={{ gap: space.sm }}>
            <T color="asphalt">Du hast noch keine Freunde. Schick zuerst eine Anfrage.</T>
            <Button label="Freunde finden" icon="people-outline" onPress={() => { router.back(); router.navigate('/friends'); }} />
          </View>
        ) : null}
        {friends?.map((f) => (
          <Pressable key={f.id} disabled={busy !== null} onPress={() => send(f)} accessibilityRole="button" accessibilityLabel={`An ${f.username} schicken`}
            style={[st.row, { backgroundColor: c.surface, opacity: busy && busy !== f.id ? 0.5 : 1 }]}>
            <Avatar source={f.avatar_url ? { uri: f.avatar_url } : undefined} size={hit} initials={f.username.slice(0, 1).toUpperCase()} />
            <T variant="name" style={{ flex: 1 }}>{f.username}</T>
            <T variant="label" color="asphalt">{busy === f.id ? 'Sendet …' : 'Schicken'}</T>
          </Pressable>
        ))}
        {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  page: { padding: space.lg, gap: space.lg },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.card },
});
