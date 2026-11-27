import { useColorScheme } from 'react-native';
import { palette, type Colors } from './tokens';

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? palette.dark : palette.light;
}

export function useIsDark() {
  return useColorScheme() === 'dark';
}
