// Übergang: alte Farbnamen der Screens auf die neuen Tokens abgebildet. Neue Screens nutzen `useColors` aus ./ui.
import { useColors } from './ui/theme';

export function useTheme() {
  const c = useColors();
  return {
    bg: c.paper, surface: c.surface, ink: c.ink, muted: c.asphalt, line: c.line,
    accent: c.ink, accentInk: c.onInk, scrim: 'rgba(0,0,0,0.55)', onPhoto: '#FFFFFF',
  };
}
export type Theme = ReturnType<typeof useTheme>;
