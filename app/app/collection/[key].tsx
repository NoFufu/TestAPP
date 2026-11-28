import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectionBanner } from '../../src/components/CollectionCard';
import { ListSpots } from '../../src/components/ListView';
import { COLLECTIONS, collectionSpots } from '../../src/data/collections';
import { useStore } from '../../src/store';
import { IconButton, T, space, useColors } from '../../src/ui';

/** Sammlung aus dem Feed: Raster und Karte. */
export default function CollectionScreen() {
  const c = useColors();
  const { key } = useLocalSearchParams<{ key: string }>();
  const { spots, city } = useStore();
  const col = COLLECTIONS.find((x) => x.key === key);
  const items = collectionSpots(key, spots, city);
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.paper }}>
      <View style={st.top}>
        <IconButton icon="chevron-down" label="Schließen" onPress={() => router.back()} />
        <T variant="name" color="asphalt" accessibilityRole="header" numberOfLines={1} style={{ flex: 1 }}>{col?.title(city) ?? 'Sammlung'}</T>
      </View>
      <ScrollView contentContainerStyle={{ gap: space.lg, paddingBottom: space.xxl }}>
        {col && items.length ? <View style={st.pad}><CollectionBanner col={col} items={items} city={city} compact /></View> : null}
        <T color="asphalt" style={st.pad}>Die beliebtesten zuerst.</T>
        <ListSpots spots={items} ranked />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },
  pad: { paddingHorizontal: space.lg },
});
