import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fmtDist } from '../../src/data/spots';
import { useStore } from '../../src/store';
import { Button, PhotoGrid, T, space, useColors } from '../../src/ui';

/** Shoots: gemerkte Spots. Später: eigene Shoot-Listen mit Route (Etappe G). */
export default function Shoots() {
  const c = useColors();
  const { spots, saved } = useStore();
  const list = spots.filter((s) => saved.has(s.id)).sort((a, b) => a.dist - b.dist);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={st.head}>
          <T variant="title" accessibilityRole="header">Shoots</T>
          <T color="asphalt">
            {list.length ? `${list.length} gemerkte ${list.length === 1 ? 'Spot' : 'Spots'}, nach Entfernung sortiert.` : 'Hier sammelst du Spots für deinen nächsten Shoot.'}
          </T>
        </View>
        {list.length ? (
          <PhotoGrid
            items={list.map((s) => ({
              key: String(s.id), photo: s.images[0], label: `${s.name}, ${fmtDist(s.dist)}`,
              onPress: () => router.push(`/spot/${s.id}`),
            }))}
          />
        ) : (
          <View style={st.empty}>
            <T color="asphalt">Tippe im Feed oder auf einer Spot-Seite auf das Lesezeichen, dann landet der Spot hier.</T>
            <Button label="Spots entdecken" icon="search" onPress={() => router.navigate('/explore')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { padding: space.lg, gap: space.xs },
  empty: { paddingHorizontal: space.lg, gap: space.lg, alignItems: 'flex-start' },
});
