import { Tabs } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { useAuth } from '../../src/lib/auth';
import { refreshUnread } from '../../src/lib/social';
import { Dock, type DockItem } from '../../src/ui';

/** Hochladen ist kein Tab mehr, sondern das + oben rechts auf Home. */
const ITEMS: DockItem[] = [
  { name: 'index', label: 'Home', on: 'home', off: 'home-outline' },
  { name: 'explore', label: 'Entdecken', on: 'map', off: 'map-outline' },
  { name: 'friends', label: 'Freunde und Nachrichten', on: 'people', off: 'people-outline' },
  { name: 'shoots', label: 'Gemerkte Spots', on: 'bookmark', off: 'bookmark-outline' },
  { name: 'profile', label: 'Profil', on: 'person-circle', off: 'person-circle-outline' },
];

export default function TabsLayout() {
  const uid = useAuth().session?.user.id;
  // Ungelesene Nachrichten: beim Start und danach alle 30 Sekunden (kein Push, erst mit eigenem Build)
  useEffect(() => { refreshUnread(uid); const t = setInterval(() => refreshUnread(uid), 30000); return () => clearInterval(t); }, [uid]);
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <Dock {...props} items={ITEMS} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="friends" />
      <Tabs.Screen name="shoots" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="upload" />
    </Tabs>
  );
}
