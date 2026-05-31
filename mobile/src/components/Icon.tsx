// Icon — lucide adlarını @expo/vector-icons Feather dəstinə map edir.
// (Lucide, Feather-in fork-udur; adların əksəriyyəti eynidir.)
import { Feather } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

type FeatherName = keyof typeof Feather.glyphMap;

const ALIAS: Record<string, FeatherName> = {
  house: 'home',
  'circle-alert': 'alert-circle',
  'triangle-alert': 'alert-triangle',
  radar: 'radio',
  'wand-sparkles': 'zap',
  'shield-check': 'shield',
  'user-pen': 'edit-3',
  pencil: 'edit-2',
  'locate-fixed': 'crosshair',
  'tree-pine': 'alert-triangle',
  'message-circle': 'message-circle',
  route: 'navigation',
  history: 'clock',
  'check-check': 'check',
  'scan-line': 'aperture',
  timer: 'clock',
};

export function Icon({
  name,
  size = 20,
  color = '#0F172A',
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  const mapped = (ALIAS[name] ?? name) as FeatherName;
  const valid = (Feather.glyphMap as Record<string, number>)[mapped] != null;
  return <Feather name={valid ? mapped : 'circle'} size={size} color={color} style={style} />;
}
