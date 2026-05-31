// Lucide ikon adapteri — dizayn kebab-case ad işlədir (məs. "map-pin"),
// lucide-react isə PascalCase komponent (MapPin). Burada çeviririk.
import type { CSSProperties, ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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

// Leaflet divIcon üçün lucide ikonunu SVG string kimi serialize et.
export function iconSVG(name: string, color = '#fff', size = 14): string {
  const Cmp = lookup(name);
  return renderToStaticMarkup(<Cmp size={size} color={color} strokeWidth={2} />);
}
