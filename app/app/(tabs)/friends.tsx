import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/lib/auth';
import {
  acceptRequest, loadFriendships, loadMembers, loadThreads, refreshUnread, removeFriendship, sendRequest,
  type Friendship, type Member, type Message,
} from '../../src/lib/social';
import { Avatar, Button, T, dock, haptic, hit, radius, space, useColors } from '../../src/ui';

type Threads = Record<string, { last: Message; unread: number }>;

/** Freunde: Anfragen, Freunde mit letzter Nachricht, alle Mitglieder. */
export default function Friends() {
  const c = useColors();
  const { session, profile } = useAuth();
  const me = session?.user.id ?? null;
  const [members, setMembers] = useState<Member[]>([]);
  const [rels, setRels] = useState<Friendship[]>([]);
  const [threads, setThreads] = useState<Threads>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!me) return;
    try {
      const [m, f, t] = await Promise.all([loadMembers(me), loadFriendships(), loadThreads(me)]);
      setMembers(m); setRels(f); setThreads(t); setError(null);
      refreshUnread(me);
    } catch { setError('Das Laden hat nicht geklappt. Zieh nach unten, um es noch mal zu versuchen.'); }
  }, [me]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!session || !profile?.username) {
    return (
      <SafeAreaView edges={['top']} style={[st.center, { backgroundColor: c.paper }]}>
        <T variant="title" accessibilityRole="header">Freunde</T>
        <T color="asphalt" style={{ textAlign: 'center' }}>Melde dich an, um Freunde zu finden und ihnen Spots zu schicken.</T>
        <Button label={session ? 'Profil fertig einrichten' : 'Anmelden'} onPress={() => router.push('/login')} />
      </SafeAreaView>
    );
  }

  const byId = new Map(members.map((m) => [m.id, m]));
  const relOf = (id: string) => rels.find((r) => r.requester === id || r.addressee === id);
  const incoming = rels.filter((r) => r.status === 'pending' && r.addressee === me);
  const outgoing = rels.filter((r) => r.status === 'pending' && r.requester === me);
  const friends = rels.filter((r) => r.status === 'accepted')
    .map((r) => byId.get(r.requester === me ? r.addressee : r.requester)).filter((m): m is Member => !!m)
    .sort((a, b) => (threads[b.id]?.last.created_at ?? '').localeCompare(threads[a.id]?.last.created_at ?? '') || a.username.localeCompare(b.username));
  const others = members.filter((m) => !relOf(m.id));
  const other = (r: Friendship) => byId.get(r.requester === me ? r.addressee : r.requester);

  async function act(key: string, fn: () => Promise<void>) {
    setBusy(key); setError(null);
    try { await fn(); haptic.select(); await load(); } catch { setError('Das hat nicht geklappt. Versuch es noch mal.'); }
    setBusy(null);
  }

  const person = (m: Member, right: React.ReactNode, onPress?: () => void, sub?: string, unread = 0) => (
    <Pressable key={m.id} disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Chat mit ${m.username}${unread ? `, ${unread} ungelesen` : ''}` : undefined}
      style={[st.row, { backgroundColor: c.surface }]}>
      <Avatar source={m.avatar_url ? { uri: m.avatar_url } : undefined} size={hit} initials={m.username.slice(0, 1).toUpperCase()} />
      <View style={{ flex: 1 }}>
        <T variant="name" numberOfLines={1}>{m.username}</T>
        {sub ? <T variant="small" color={unread ? 'ink' : 'asphalt'} numberOfLines={1} style={unread ? { fontWeight: '600' } : undefined}>{sub}</T> : null}
      </View>
      {right}
    </Pressable>
  );
  const preview = (m: Member) => {
    const t = threads[m.id]?.last;
    if (!t) return 'Noch keine Nachricht. Schick einen Spot.';
    return `${t.sender === me ? 'Du: ' : ''}${t.body || '📍 Spot geschickt'}`;
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: dock.clearance }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={c.asphalt}
          onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        <View style={st.head}>
          <T variant="title" accessibilityRole="header">Freunde</T>
          <T color="asphalt">Schick Freunden Spots und verabredet euch.</T>
          {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
        </View>

        {incoming.length ? (
          <View style={st.section}>
            <T variant="name" accessibilityRole="header">Anfragen an dich</T>
            {incoming.map((r) => { const m = other(r); return m ? person(m, (
              <View style={st.btns}>
                <Button label="Annehmen" disabled={busy === `a${r.id}`} onPress={() => act(`a${r.id}`, () => acceptRequest(r.id))} />
                <Button label="Nein" variant="ghost" onPress={() => act(`d${r.id}`, () => removeFriendship(r.id))} />
              </View>
            )) : null; })}
          </View>
        ) : null}

        <View style={st.section}>
          <T variant="name" accessibilityRole="header">Deine Freunde</T>
          {friends.length ? friends.map((m) => person(m, threads[m.id]?.unread ? (
            <View style={[st.unread, { backgroundColor: c.cherry }]}><T variant="small" color="onPhoto" style={{ fontWeight: '700' }}>{threads[m.id].unread}</T></View>
          ) : null, () => router.push(`/chat/${m.id}`), preview(m), threads[m.id]?.unread ?? 0))
            : <T variant="small" color="asphalt">Noch keine Freunde. Schick unten jemandem eine Anfrage.</T>}
        </View>

        {outgoing.length ? (
          <View style={st.section}>
            <T variant="name" accessibilityRole="header">Angefragt</T>
            {outgoing.map((r) => { const m = other(r); return m ? person(m, (
              <Button label="Zurückziehen" variant="ghost" onPress={() => act(`w${r.id}`, () => removeFriendship(r.id))} />
            ), undefined, 'Wartet auf Antwort') : null; })}
          </View>
        ) : null}

        <View style={st.section}>
          <T variant="name" accessibilityRole="header">Alle Mitglieder</T>
          {others.length ? others.map((m) => person(m, (
            <Button label="Anfragen" icon="person-add-outline" variant="secondary" disabled={busy === `s${m.id}`}
              onPress={() => act(`s${m.id}`, () => sendRequest(me!, m.id))} />
          ))) : <T variant="small" color="asphalt">Sonst hat sich noch niemand angemeldet.</T>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl },
  head: { padding: space.lg, gap: space.xs },
  section: { paddingHorizontal: space.lg, paddingBottom: space.xl, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.card },
  btns: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  unread: { minWidth: space.xl, height: space.xl, borderRadius: space.xl / 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xs },
});
