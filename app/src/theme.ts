import { useColorScheme } from 'react-native';

const light = {
  bg: '#F1F2F5', surface: '#FFFFFF', ink: '#12141B', muted: '#5B6170', line: '#DCDFE5',
  accent: '#2B4BFF', accentInk: '#FFFFFF', scrim: 'rgba(8,9,14,0.72)', onPhoto: '#FFFFFF',
};
const dark: typeof light = {
  bg: '#0E0F14', surface: '#191B22', ink: '#ECEEF3', muted: '#9AA0AE', line: '#2B2E38',
  accent: '#8193FF', accentInk: '#0E0F14', scrim: 'rgba(8,9,14,0.72)', onPhoto: '#FFFFFF',
};
export type Theme = typeof light;
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
