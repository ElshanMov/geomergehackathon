// Lucide ikon adapteri — dizayn kebab-case ad işlədir (məs. "shield-check"),
// lucide-react isə PascalCase komponent (ShieldCheck). Burada çeviririk.
import type { CSSProperties, ComponentType } from 'react';
import * as Lucide from 'lucide-react';

type LucideProps = {
  size?: number | string;
  strokeWidth?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
};
type LucideComp = ComponentType<LucideProps>;

const kebabToPascal = (s: string): string =>
  s
    .split('-')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join('');

function lookup(name: string): LucideComp {
  const lib = Lucide as unknown as Record<string, LucideComp>;
  return lib[kebabToPascal(name)] ?? lib.Circle;
}

export interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 16, strokeWidth = 2, color, style, className }: IconProps) {
  const Cmp = lookup(name);
  return <Cmp size={size} strokeWidth={strokeWidth} color={color} style={style} className={className} />;
}
