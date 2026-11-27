import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/lib/auth';
import { Avatar, Button, IconButton, T, hit, radius, space, type, useColors } from '../src/ui';

type Mode = 'signin' | 'signup';

/** Anmelden / Registrieren mit E-Mail + Passwort, danach Benutzername und Profilbild. */
export default function Login() {
  const c = useColors();
  const { session, profile, signIn, signUp, saveProfile } = useAuth();
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsProfile = !!session && profile !== null && !profile.username;

  // Fertig angemeldet mit Benutzername → schließen
  useEffect(() => {
    if (session && profile?.username) router.back();
  }, [session, profile]);

  async function submit() {
    setBusy(true); setError(null);
    const err = mode === 'signup' ? await signUp(email, password) : await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
  }

  async function pickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!res.canceled) setAvatar(res.assets[0].uri);
  }

  async function finish() {
    setBusy(true); setError(null);
    const err = await saveProfile(username, avatar);
    setBusy(false);
    if (err) setError(err);
  }

  const input = [type.body, st.input, { borderColor: c.line, backgroundColor: c.surface, color: c.ink }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.page} keyboardShouldPersistTaps="handled">
          <View style={st.close}>
            <IconButton icon="close" label="Schließen" onPress={() => router.back()} />
          </View>

          {needsProfile ? (
            <>
              <View style={{ gap: space.xs }}>
                <T variant="display" accessibilityRole="header">Wie heißt du?</T>
                <T color="asphalt">Dein Benutzername steht bei jedem Spot, den du entdeckst.</T>
              </View>
              <Pressable onPress={pickAvatar} style={st.avatarRow} accessibilityRole="button" accessibilityLabel="Profilbild auswählen">
                <Avatar source={avatar ? { uri: avatar } : undefined} size={72} initials={username.slice(0, 1).toUpperCase() || '+'} />
                <T variant="label">{avatar ? 'Profilbild ändern' : 'Profilbild wählen (optional)'}</T>
              </Pressable>
              <View style={{ gap: space.sm }}>
                <T variant="label">Benutzername</T>
                <TextInput
                  value={username}
                  onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                  autoCapitalize="none" autoCorrect={false} maxLength={24}
                  placeholder="z. B. lena.fits" placeholderTextColor={c.asphalt}
                  accessibilityLabel="Benutzername" style={input}
                />
                <T variant="small" color="asphalt">3 bis 24 Zeichen: Kleinbuchstaben, Zahlen, Punkt, Unterstrich.</T>
              </View>
              {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
              <Button label="Fertig" loading={busy} disabled={username.length < 3} onPress={finish} />
            </>
          ) : (
            <>
              <View style={{ gap: space.xs }}>
                <T variant="display" accessibilityRole="header">{mode === 'signup' ? 'Konto erstellen' : 'Anmelden'}</T>
                <T color="asphalt">Damit du Spots hochladen kannst und andere sie sehen.</T>
              </View>
              <View style={[st.seg, { backgroundColor: c.fill }]} accessibilityRole="tablist">
                {(['signup', 'signin'] as const).map((m) => (
                  <Pressable key={m} onPress={() => { setMode(m); setError(null); }}
                    accessibilityRole="tab" accessibilityState={{ selected: mode === m }}
                    style={[st.segBtn, mode === m && { backgroundColor: c.surface }]}>
                    <T variant="label" color={mode === m ? 'ink' : 'asphalt'}>{m === 'signup' ? 'Neu hier' : 'Ich habe ein Konto'}</T>
                  </Pressable>
                ))}
              </View>
              <View style={{ gap: space.sm }}>
                <T variant="label">E-Mail</T>
                <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
                  keyboardType="email-address" textContentType="emailAddress" autoComplete="email"
                  placeholder="du@beispiel.de" placeholderTextColor={c.asphalt} accessibilityLabel="E-Mail" style={input} />
              </View>
              <View style={{ gap: space.sm }}>
                <T variant="label">Passwort</T>
                <TextInput value={password} onChangeText={setPassword} secureTextEntry
                  textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="mindestens 8 Zeichen" placeholderTextColor={c.asphalt} accessibilityLabel="Passwort" style={input} />
              </View>
              {error ? <T color="danger" accessibilityLiveRegion="polite">{error}</T> : null}
              <Button
                label={mode === 'signup' ? 'Konto erstellen' : 'Anmelden'}
                loading={busy}
                disabled={!email.includes('@') || password.length < 8}
                onPress={submit}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  page: { padding: space.lg, gap: space.xl, paddingBottom: space.xxl },
  close: { alignItems: 'flex-end', marginRight: -space.sm },
  seg: { flexDirection: 'row', padding: 3, borderRadius: radius.pill },
  segBtn: { flex: 1, minHeight: hit - 4, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  input: { borderWidth: 1, borderRadius: radius.thumb, paddingHorizontal: space.md + 2, paddingVertical: space.md },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
});
