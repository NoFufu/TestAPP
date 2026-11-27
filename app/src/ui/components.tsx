import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, type ImageSource } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import {
  AccessibilityInfo, ActivityIndicator, Animated, Pressable, StyleSheet, Text, View,
  type PressableProps, type StyleProp, type TextProps, type ViewStyle,
} from 'react-native';
import { useColors } from './theme';
import { hit, motion, radius, space, type, type Colors, type TypeVariant } from './tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

/* ---------- Text ---------- */
type TProps = TextProps & { variant?: TypeVariant; color?: keyof Colors };
/** Text mit Schriftstufe aus den Tokens. Standard: body in Tinte. */
export function T({ variant = 'body', color = 'ink', style, ...rest }: TProps) {
  const c = useColors();
  return <Text {...rest} style={[type[variant], { color: c[color] }, style]} />;
}

/* ---------- Button ---------- */
type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};
/** primary = Tinte gefüllt (Hauptaktion), secondary = Rahmen, ghost = nur Text. */
export function Button({ label, variant = 'primary', icon, loading, disabled, style, ...rest }: ButtonProps) {
  const c = useColors();
  const fg = variant === 'primary' ? c.onInk : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' && { backgroundColor: c.ink },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: c.ink },
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text style={[type.name, { color: fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

/* ---------- IconButton ---------- */
type IconButtonProps = Omit<PressableProps, 'children'> & {
  icon: IconName;
  label: string; // Pflicht für Screenreader
  color?: string;
  size?: number;
  filled?: boolean; // Fläche hinter dem Icon (z. B. über Fotos/Karte)
};
export function IconButton({ icon, label, color, size = 24, filled, style, ...rest }: IconButtonProps) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={(st) => [
        s.iconBtn,
        filled && { backgroundColor: c.surface, borderRadius: radius.thumb },
        { opacity: st.pressed ? 0.6 : 1 },
        typeof style === 'function' ? style(st) : style,
      ]}
      {...rest}
    >
      <Ionicons name={icon} size={size} color={color ?? c.ink} />
    </Pressable>
  );
}

/* ---------- Chip ---------- */
type ChipProps = { label: string; selected?: boolean; dot?: string; onPress?: () => void };
/** Filter-Chip. Ausgewählt = Tinte gefüllt. `dot` = kleine Kategorie-Farbe. */
export function Chip({ label, selected, dot, onPress }: ChipProps) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={4}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      style={({ pressed }) => [
        s.chip,
        { backgroundColor: selected ? c.ink : c.surface, borderColor: selected ? c.ink : c.line, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      {dot ? <View style={[s.dot, { backgroundColor: dot }]} /> : null}
      <Text style={[type.label, { color: selected ? c.onInk : c.ink }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- SpotSign (Erkennungszeichen) ---------- */
type SpotSignProps = { name: string; distance?: string; onPress?: () => void; style?: StyleProp<ViewStyle> };
/** Das Spot-Schild: sitzt unten links auf Fotos, wie ein Straßenschild. */
export function SpotSign({ name, distance, onPress, style }: SpotSignProps) {
  const c = useColors();
  const body = (
    <View style={[s.sign, { backgroundColor: c.sign }, style]}>
      <Ionicons name="location-sharp" size={13} color={c.onSign} />
      <Text style={[type.sign, { color: c.onSign }]} numberOfLines={1}>{name}</Text>
      {distance ? <Text style={[type.signMeta, { color: c.onSign, opacity: 0.7 }]}>{distance}</Text> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Spot ${name}${distance ? `, ${distance} entfernt` : ''}`}>
      {body}
    </Pressable>
  ) : body;
}

/* ---------- Avatar ---------- */
type AvatarProps = { source?: ImageSource | number; size?: number; ring?: 'new' | 'seen' | 'none'; label?: string; initials?: string };
/** Rundes Profil- oder Story-Bild. ring=new: Tintenring (neu), seen: grauer Ring. */
export function Avatar({ source, size = 32, ring = 'none', label, initials }: AvatarProps) {
  const c = useColors();
  const pad = ring === 'none' ? 0 : 2.5;
  return (
    <View
      accessibilityLabel={label}
      style={{ width: size, height: size, borderRadius: size / 2, padding: pad, backgroundColor: ring === 'new' ? c.ink : ring === 'seen' ? c.line : 'transparent' }}
    >
      {source ? (
        <Image
          source={source}
          style={{ flex: 1, borderRadius: size / 2, borderWidth: ring === 'none' ? 0 : 2, borderColor: c.paper, backgroundColor: c.fill }}
          contentFit="cover"
        />
      ) : (
        <View style={{ flex: 1, borderRadius: size / 2, borderWidth: ring === 'none' ? 0 : 2, borderColor: c.paper, backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center' }}>
          {initials ? <Text style={[type.label, { color: c.asphalt, fontSize: Math.round(size * 0.38) }]}>{initials}</Text> : null}
        </View>
      )}
    </View>
  );
}

/* ---------- Skeleton ---------- */
/** Ruhiger Platzhalter beim Laden (pulsiert leicht). */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const o = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    let stopped = false;
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (stopped || reduce) return;
      loop = Animated.loop(Animated.sequence([
        Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ]));
      loop.start();
    });
    return () => { stopped = true; loop?.stop(); };
  }, [o]);
  return <Animated.View style={[{ backgroundColor: c.fill, opacity: o }, style]} />;
}

/* ---------- Sheet ---------- */
/** Fläche, die unten über Karte/Inhalt schwebt. Inhalt kommt als children. */
export function Sheet({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[s.sheet, { backgroundColor: c.surface, borderColor: c.line }, style]}>{children}</View>;
}

/* ---------- LikeBurst + Doppeltipp ---------- */
/** Liefert Doppeltipp-Erkennung und das aufpoppende Herz für Fotos. */
export function useDoubleTap(onDouble: () => void, onSingle?: () => void) {
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return () => {
    const now = Date.now();
    if (now - last.current < 280) {
      if (timer.current) clearTimeout(timer.current);
      last.current = 0;
      onDouble();
    } else {
      last.current = now;
      if (onSingle) timer.current = setTimeout(onSingle, 290);
    }
  };
}

export function LikeBurst({ trigger }: { trigger: number }) {
  const c = useColors();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    opacity.setValue(1);
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
    scale.setValue(reduce ? 1 : 0.3);
    if (reduce) {
      Animated.sequence([Animated.delay(450), Animated.timing(opacity, { toValue: 0, duration: motion.base, useNativeDriver: true })]).start();
      return;
    }
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, ...motion.pop }),
      Animated.sequence([Animated.delay(450), Animated.timing(opacity, { toValue: 0, duration: motion.base, useNativeDriver: true })]),
    ]).start();
    });
  }, [trigger, scale, opacity]);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.center, { opacity, transform: [{ scale }] }]}>
      <Ionicons name="heart" size={96} color={c.cherry} />
    </Animated.View>
  );
}

export const haptic = {
  like: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  select: () => Haptics.selectionAsync().catch(() => {}),
};

const s = StyleSheet.create({
  btn: { minHeight: hit + 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.xl, borderRadius: radius.pill },
  iconBtn: { minWidth: hit, minHeight: hit, alignItems: 'center', justifyContent: 'center' },
  chip: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md + 2, borderRadius: radius.pill, borderWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sign: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingLeft: space.sm, paddingRight: 10, paddingVertical: 5, borderRadius: radius.sign, maxWidth: 260 },
  sheet: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
