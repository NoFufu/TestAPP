import { BarlowCondensed_500Medium, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold, useFonts } from '@expo-google-fonts/barlow-condensed';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '../src/lib/auth';
import { StoreProvider } from '../src/store';
import { useColors } from '../src/ui';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const c = useColors();
  const [loaded, error] = useFonts({ BarlowCondensed_500Medium, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold });
  useEffect(() => { if (loaded || error) SplashScreen.hideAsync().catch(() => {}); }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <AuthProvider>
    <StoreProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.paper } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="spot/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-photo" options={{ presentation: 'modal' }} />
      </Stack>
    </StoreProvider>
    </AuthProvider>
  );
}
