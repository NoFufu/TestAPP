import { Tabs } from 'expo-router/js-tabs';
import { Dock, type DockItem } from '../../src/ui';

/** Hochladen ist kein Tab mehr, sondern das + oben rechts auf Home. */
const ITEMS: DockItem[] = [
  { name: 'index', label: 'Home', on: 'home', off: 'home-outline' },
  { name: 'explore', label: 'Entdecken', on: 'search', off: 'search-outline' },
  { name: 'shoots', label: 'Gemerkte Spots', on: 'bookmark', off: 'bookmark-outline' },
  { name: 'profile', label: 'Profil', on: 'person-circle', off: 'person-circle-outline' },
];

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <Dock {...props} items={ITEMS} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="shoots" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="upload" />
    </Tabs>
  );
}
