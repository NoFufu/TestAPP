import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../src/store';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="spot/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </StoreProvider>
  );
}
