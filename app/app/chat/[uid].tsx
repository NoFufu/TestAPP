import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { catInfo, fmtDist } from '../../src/data/spots';
import { useAuth } from '../../src/lib/auth';
import { loadConversation, markRead, sendMessage, type Message } from '../../src/lib/social';
import { supabase } from '../../src/lib/supabase';
import { useStore } from '../../src/store';
import { Avatar, Button, Chip, IconButton, T, chat, haptic, hit, radius, space, type, useColors } from '../../src/ui';

const QUICK = ['Treffen wir uns hier?', 'Das sieht gut aus!', 'Wann hast du Zeit?'];
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Chat mit einem Freund: Text und Spots schicken. Aktualisiert alle paar Sekunden, solange er offen ist. */
export default function Chat() {
  const c = useColors();
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { session } = useAuth();
  const me = session?.user.id;
  const { spots } = useStore();
  const [friend, setFriend] = useState<{ username: string; avatar_url: string | null } | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [spotId, setSpotId] = useState<number | null>(null);
  const [picking, setPicking] = useState(false);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('username, avatar_url').eq('id', uid).maybeSingle().then(({ data }) => setFriend(data as typeof friend));
  }, [uid]);

  const load = useCallback(async () => {
    if (!me || !uid) return;
    try { setMsgs(await loadConversation(me, uid)); await markRead(me, uid); } catch { /* beim nächsten Durchlauf */ }
  }, [me, uid]);
  useFocusEffect(useCallback(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, [load]));

  const picked = spotId != null ? spots.find((s) => s.id === spotId) : null;
  const choices = useMemo(() => {
    const w = norm(q).split(/\s+/).filter(Boolean);
    return [...spots].filter((s) => w.every((x) => norm(`${s.name} ${s.area}`).includes(x))).sort((a, b) => a.dist - b.dist).slice(0, 30);
  }, [spots, q]);

  async function send(body = text) {
    if (!me || !uid || sending || (!body.trim() && spotId == null)) return;
    setSending(true); setError(null);
    try {
      await sendMessage(me, uid, body, spotId);
      haptic.select();
      setText(''); setSpotId(null);
      await load();
    } catch { setError('Senden hat nicht geklappt. Seid ihr noch befreundet? Versuch es noch mal.'); }
    setSending(false);
  }

  const bubble = ({ item: m }: { item: Message }) => {
    const mine = m.sender === me;
    const sp = m.spot_id != null ? spots.find((s) => s.id === m.spot_id) : null;
    return (
      <View style={[st.bubble, mine ? st.mine : st.theirs, { backgroundColor: mine ? c.ink : c.surface }]}>
        {m.spot_id != null ? (sp ? (
          <Pressable onPress={() => router.push(`/spot/${sp.id}`)} accessibilityRole="button" accessibilityLabel={`Spot ${sp.name} öffnen`} style={st.spotCard}>
            <Image source={sp.images[0]} contentFit="cover" style={[st.spotImg, { backgroundColor: c.fill }]} />
            <T variant="sign" numberOfLines={1} style={{ color: mine ? c.onInk : c.ink }}>{sp.name}</T>
            <T variant="small" numberOfLines={1} style={{ color: mine ? c.onInk : c.asphalt, opacity: 0.8 }}>{fmtDist(sp.dist)}, {catInfo(sp.cats[0]).label}</T>
          </Pressable>
        ) : <T variant="small" style={{ color: mine ? c.onInk : c.asphalt }}>Dieser Spot ist nicht mehr verfügbar.</T>) : null}
        {m.body ? <T style={{ color: mine ? c.onInk : c.ink }}>{m.body}</T> : null}
        <T variant="small" style={{ color: mine ? c.onInk : c.asphalt, opacity: 0.6, alignSelf: 'flex-end' }}>
          {new Date(m.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}{mine && m.read_at ? ' ✓' : ''}
        </T>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-back" label="Zurück" onPress={() => router.back()} />
        <Avatar source={friend?.avatar_url ? { uri: friend.avatar_url } : undefined} size={hit - space.sm} initials={friend?.username.slice(0, 1).toUpperCase()} />
        <T variant="name" accessibilityRole="header" numberOfLines={1} style={{ flex: 1 }}>{friend?.username ?? 'Chat'}</T>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList inverted data={msgs} keyExtractor={(m) => String(m.id)} renderItem={bubble}
          contentContainerStyle={st.list} keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<T color="asphalt" style={st.empty}>Noch keine Nachrichten. Schick einen Spot und fragt, ob ihr euch dort trefft.</T>} />

        {picking ? (
          <View style={[st.picker, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={[st.field, { backgroundColor: c.fill }]}>
              <Ionicons name="search" size={18} color={c.asphalt} />
              <TextInput value={q} onChangeText={setQ} placeholder="Spot suchen" placeholderTextColor={c.asphalt} autoCorrect={false}
                accessibilityLabel="Spot suchen" style={[type.body, st.input, { color: c.ink }]} />
              <IconButton icon="close" label="Auswahl schließen" size={20} onPress={() => setPicking(false)} />
            </View>
            <FlatList data={choices} keyExtractor={(s) => String(s.id)} keyboardShouldPersistTaps="handled" style={st.pickList}
              renderItem={({ item: s }) => (
                <Pressable onPress={() => { setSpotId(s.id); setPicking(false); setQ(''); }} accessibilityRole="button" accessibilityLabel={`${s.name} auswählen`} style={st.pickRow}>
                  <Image source={s.images[0]} contentFit="cover" style={[st.pickImg, { backgroundColor: c.fill }]} />
                  <View style={{ flex: 1 }}>
                    <T variant="name" numberOfLines={1}>{s.name}</T>
                    <T variant="small" color="asphalt" numberOfLines={1}>{s.area || s.city} · {fmtDist(s.dist)}</T>
                  </View>
                </Pressable>
              )} />
          </View>
        ) : null}

        {picked ? (
          <View style={st.attached}>
            <View style={[st.chip, { backgroundColor: c.surface, borderColor: c.line }]}>
              <Ionicons name="location-sharp" size={16} color={c.ink} />
              <T variant="label" numberOfLines={1} style={{ flex: 1 }}>{picked.name}</T>
              <Pressable hitSlop={space.md} onPress={() => setSpotId(null)} accessibilityRole="button" accessibilityLabel="Spot wieder entfernen">
                <Ionicons name="close-circle" size={18} color={c.asphalt} />
              </Pressable>
            </View>
            <View style={st.quick}>{QUICK.map((qk) => <Chip key={qk} label={qk} onPress={() => send(qk)} />)}</View>
          </View>
        ) : null}
        {error ? <T variant="small" color="danger" style={st.err} accessibilityLiveRegion="polite">{error}</T> : null}

        <View style={st.compose}>
          <IconButton icon="location-outline" label="Spot anhängen" onPress={() => setPicking(!picking)} />
          <TextInput value={text} onChangeText={setText} maxLength={1000} multiline placeholder="Nachricht" placeholderTextColor={c.asphalt}
            accessibilityLabel="Nachricht schreiben" style={[type.body, st.msgInput, { backgroundColor: c.fill, color: c.ink }]} />
          <Button label="Senden" icon="send" loading={sending} disabled={!text.trim() && spotId == null} onPress={() => send()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm, paddingBottom: space.sm },
  list: { padding: space.md, gap: space.sm },
  empty: { textAlign: 'center', padding: space.xl, transform: [{ scaleY: -1 }] },
  bubble: { maxWidth: '82%', borderRadius: radius.card, padding: space.md, gap: space.xs },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: radius.sign },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: radius.sign },
  spotCard: { gap: space.xs, width: chat.spotW },
  spotImg: { width: chat.spotW, height: chat.spotH, borderRadius: radius.thumb },
  picker: { maxHeight: 320, borderTopWidth: StyleSheet.hairlineWidth, padding: space.sm, gap: space.sm },
  field: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: hit, borderRadius: radius.pill, paddingLeft: space.md, paddingRight: space.xs },
  input: { flex: 1, paddingVertical: space.sm },
  pickList: { flexGrow: 0 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs, minHeight: hit },
  pickImg: { width: hit, height: hit, borderRadius: radius.thumb },
  attached: { paddingHorizontal: space.md, gap: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: space.xs, padding: space.sm, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  err: { paddingHorizontal: space.md },
  compose: { flexDirection: 'row', alignItems: 'flex-end', gap: space.xs, padding: space.sm },
  msgInput: { flex: 1, maxHeight: 120, borderRadius: radius.card, paddingHorizontal: space.md, paddingVertical: space.sm + 2 },
});
