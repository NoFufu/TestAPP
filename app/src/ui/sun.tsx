import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { T } from './components';
import { useColors } from './theme';
import { space } from './tokens';

const W = 300, H = 150, CX = 150, CY = 135, R = 115;
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

/** Sonnenuhr: Bogen von Aufgang bis Untergang, Golden Hour farbig, Sonne an der aktuellen Stelle. */
export function SunArc({ sunrise, sunset, golden, now = new Date() }: { sunrise: Date; sunset: Date; golden: Date; now?: Date }) {
  const c = useColors();
  if (!ok(sunrise) || !ok(sunset)) return null;
  const span = sunset.getTime() - sunrise.getTime();
  const f = (d: Date) => (d.getTime() - sunrise.getTime()) / span;
  const t = f(now), g = ok(golden) ? f(golden) : 0.85;
  const day = t >= 0 && t <= 1;
  const sun = pt(t);
  const mins = Math.round((golden.getTime() - now.getTime()) / 60000);
  const head = t > 1 ? 'Sonne ist unter' : t < 0 ? `Aufgang ${hhmm(sunrise)}`
    : t >= g ? 'Jetzt Golden Hour' : mins < 120 ? `Golden Hour in ${mins} min` : `Golden Hour ab ${hhmm(golden)}`;

  return (
    <View accessible accessibilityLabel={`${head}. Sonnenaufgang ${hhmm(sunrise)}, Sonnenuntergang ${hhmm(sunset)}`}>
      <Svg width="100%" height={undefined} viewBox={`0 0 ${W} ${H}`} style={{ aspectRatio: W / H }}>
        <Line x1={10} y1={CY} x2={W - 10} y2={CY} stroke={c.line} strokeWidth={1.5} />
        <Path d={arc(0, 1)} stroke={c.sunTrack} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 8" />
        <Path d={arc(g, 1)} stroke={c.sun} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.45} />
        {day ? <Path d={arc(0, t)} stroke={c.sun} strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
        {day ? (
          <>
            <Circle cx={sun.x} cy={sun.y} r={16} fill={c.sun} opacity={0.25} />
            <Circle cx={sun.x} cy={sun.y} r={9} fill={c.sun} />
          </>
        ) : null}
      </Svg>
      <View style={st.center} pointerEvents="none">
        <T variant="stat">{head}</T>
      </View>
      <View style={st.row}>
        <T variant="small" color="asphalt">↑ {hhmm(sunrise)}</T>
        <T variant="small" color="asphalt">↓ {hhmm(sunset)}</T>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  center: { position: 'absolute', left: 0, right: 0, bottom: space.xl + space.sm, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.xs },
});
