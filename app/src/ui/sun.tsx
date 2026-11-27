import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { T } from './components';
import { useColors } from './theme';
import { space } from './tokens';

const W = 34, H = 19, CX = 17, CY = 17, R = 14;
const hhmm = (d: Date) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const pt = (t: number) => {
  const a = Math.PI * (1 - Math.min(1, Math.max(0, t)));
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
};
const arc = (a: number, b: number) => {
  const p = pt(a), q = pt(b);
  return `M ${p.x} ${p.y} A ${R} ${R} 0 0 1 ${q.x} ${q.y}`;
};
const ok = (d: Date) => !isNaN(d.getTime());

/** Kleine Sonnenuhr: Mini-Bogen mit Sonne an der aktuellen Stelle + ein kurzer Satz. */
export function SunArc({ sunrise, sunset, golden, now = new Date() }: { sunrise: Date; sunset: Date; golden: Date; now?: Date }) {
  const c = useColors();
  if (!ok(sunrise) || !ok(sunset)) return null;
  const span = sunset.getTime() - sunrise.getTime();
  const t = (now.getTime() - sunrise.getTime()) / span;
  const g = ok(golden) ? (golden.getTime() - sunrise.getTime()) / span : 0.85;
  const day = t >= 0 && t <= 1;
  const sun = pt(t);
  const label = t > 1 ? `Sonne unter · ${hhmm(sunset)}` : t < 0 ? `Aufgang ${hhmm(sunrise)}`
    : t >= g ? `Golden Hour jetzt · bis ${hhmm(sunset)}` : `Golden Hour ${hhmm(golden)}`;

  return (
    <View style={st.row} accessible accessibilityLabel={`${label}. Sonnenuntergang ${hhmm(sunset)}`}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path d={arc(0, 1)} stroke={c.sunTrack} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d={arc(g, 1)} stroke={c.sun} strokeWidth={2} fill="none" strokeLinecap="round" />
        {day ? <Circle cx={sun.x} cy={sun.y} r={3.5} fill={c.sun} /> : null}
      </Svg>
      <T variant="label" color="asphalt">{label}</T>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
});
