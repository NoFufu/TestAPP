import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store';
import { Avatar, Button, PhotoGrid, T, radius, space, useColors } from '../../src/ui';

/** Profil: bis zum Login (Etappe A) ein lokales Profil mit eigenen Uploads. */
export default function Profile() {
  const c = useColors();
  const { spots, saved, likedPosts } = useStore();
  const mine = spots.filter((s) => s.user);
  const stats = [
    { n: mine.length, label: 'Spots' },
    { n: saved.size, label: 'Gemerkt' },
    { n: likedPosts.size, label: 'Likes vergeben' },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={st.head}>
          <Avatar size={84} ring="seen" label="Dein Profilbild" />
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
          <T variant="name">Du</T>
          <T color="asphalt">Melde dich bald an, um Credits für deine Spots und Outfits zu sammeln.</T>
        </View>
        <View style={[st.notice, { backgroundColor: c.surface, borderColor: c.line }]}>
          <T variant="label">Anmelden kommt mit dem nächsten Update</T>
          <T variant="small" color="asphalt">Bis dahin bleiben deine Uploads nur auf diesem Handy.</T>
        </View>
        {mine.length ? (
          <PhotoGrid items={mine.map((s) => ({ key: String(s.id), photo: s.images[0], label: s.name, onPress: () => router.push(`/spot/${s.id}`) }))} />
        ) : (
          <View style={st.empty}>
            <T color="asphalt">Du hast noch keinen Spot hochgeladen.</T>
            <Button label="Ersten Spot hochladen" icon="add" onPress={() => router.navigate('/upload')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.xl, padding: space.lg },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  text: { paddingHorizontal: space.lg, gap: 2 },
  notice: { margin: space.lg, padding: space.md, gap: 2, borderRadius: radius.thumb + 2, borderWidth: StyleSheet.hairlineWidth },
  empty: { paddingHorizontal: space.lg, gap: space.lg, alignItems: 'flex-start' },
});
