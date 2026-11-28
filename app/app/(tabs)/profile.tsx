import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEGAL } from '../../src/config';
import { fmtDist } from '../../src/data/spots';
import { useScrollTopOnTab } from '../../src/lib/scrollTop';
import { useAuth } from '../../src/lib/auth';
import { isAdmin } from '../../src/lib/upload';
import { useStore } from '../../src/store';
import { Avatar, Button, PhotoGrid, T, space, useColors, dock } from '../../src/ui';

export default function Profile() {
  const c = useColors();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  useScrollTopOnTab('profile', scroll);
  const { session, profile, signOut, saveProfile, deleteAccount } = useAuth();
  const { spots, saved } = useStore();
  const [busy, setBusy] = useState(false);
  const [admin, setAdmin] = useState(false);
  useEffect(() => { if (session) isAdmin().then(setAdmin); else setAdmin(false); }, [session]);

  if (!session || !profile?.username) {
    return (
      <SafeAreaView edges={['top']} style={[st.center, { backgroundColor: c.paper }]}>
        <Avatar size={84} ring="seen" />
        <T variant="title" accessibilityRole="header">Dein Profil</T>
        <T color="asphalt" style={{ textAlign: 'center' }}>Melde dich an, um Spots hochzuladen. Bei jedem Spot steht dann, dass du ihn entdeckt hast.</T>
        <Button label={session ? 'Profil fertig einrichten' : 'Anmelden'} onPress={() => router.push('/login')} />
      </SafeAreaView>
    );
  }

  const mine = spots.filter((s) => s.creator === profile.username);
  const stats = [
    { n: mine.length, label: 'Spots' },
    { n: saved.size, label: 'Gemerkt' },
  ];

  function confirmDelete() {
    Alert.alert('Konto löschen?', 'Dein Profil, deine Fotos, Nachrichten und Freunde werden endgültig gelöscht. Das lässt sich nicht rückgängig machen.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Endgültig löschen', style: 'destructive', onPress: async () => {
        setBusy(true);
        const err = await deleteAccount();
        setBusy(false);
        if (err) Alert.alert('Konto löschen', err);
      } },
    ]);
  }
  const openLegal = (url: string) => { if (url) Linking.openURL(url); };

  async function changeAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (res.canceled || !profile?.username) return;
    setBusy(true);
    await saveProfile(profile.username, res.assets[0].uri);
    setBusy(false);
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: dock.clearance }}>
        <View style={st.head}>
          <Pressable onPress={changeAvatar} disabled={busy} accessibilityRole="button" accessibilityLabel="Profilbild ändern">
            <Avatar source={profile.avatar_url ? { uri: profile.avatar_url } : undefined} size={84} ring="new"
              initials={profile.username.slice(0, 1).toUpperCase()} />
          </Pressable>
          <View style={st.stats}>
            {stats.map((x) => (
              <View key={x.label} style={st.stat} accessible accessibilityLabel={`${x.n} ${x.label}`}>
                <T variant="stat">{x.n}</T>
                <T variant="small" color="asphalt">{x.label}</T>
              </View>
            ))}
          </View>
        </View>
        <View style={st.text}>
          <T variant="name">{profile.username}</T>
          <T variant="small" color="asphalt">{session.user.email}</T>
        </View>
        <View style={st.actions}>
          <Button label="Spot hochladen" icon="add" style={{ flex: 1 }} onPress={() => router.navigate('/upload')} />
          <Button label="Meine Inhalte" icon="create-outline" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/mine')} />
        </View>
        {admin ? (
          <View style={[st.actions, { paddingTop: 0 }]}>
            <Button label="Start-Fotos" icon="camera-outline" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/start-photos')} />
            <Button label="Prüfen" icon="shield-checkmark-outline" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/review')} />
          </View>
        ) : null}
        <View style={[st.actions, { paddingTop: 0 }]}>
          <Button label="Feedback" icon="chatbubble-ellipses-outline" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/feedback')} />
          <Button label="Abmelden" variant="secondary" style={{ flex: 1 }} onPress={signOut} />
        </View>
        <View style={[st.actions, { paddingTop: 0 }]}>
          <Button label="Datenschutz" variant="ghost" disabled={!LEGAL.privacy} style={{ flex: 1 }} onPress={() => openLegal(LEGAL.privacy)} />
          <Button label="Impressum" variant="ghost" disabled={!LEGAL.imprint} style={{ flex: 1 }} onPress={() => openLegal(LEGAL.imprint)} />
          <Button label="Konto löschen" variant="ghost" loading={busy} style={{ flex: 1 }} onPress={confirmDelete} />
        </View>
        {mine.length ? (
          <PhotoGrid items={mine.map((s) => ({
            key: String(s.id), photo: s.images[0], label: `${s.name}, ${fmtDist(s.dist)}`,
            onPress: () => router.push(`/spot/${s.id}`),
          }))} />
        ) : (
          <T color="asphalt" style={{ paddingHorizontal: space.lg }}>Du hast noch keinen Spot entdeckt. Dein erster landet hier.</T>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.xl, padding: space.lg },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  text: { paddingHorizontal: space.lg, gap: 2 },
  actions: { flexDirection: 'row', gap: space.sm, padding: space.lg },
});
