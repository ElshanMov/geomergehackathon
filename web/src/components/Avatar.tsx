import { useActors } from '../context/AppContext';

export function Avatar({ actor, size = 28 }: { actor: string; size?: number }) {
  const actors = useActors();
  const a = actors[actor] ?? { init: '?', color: '#94A3B8', name: '' };
  return (
    <div
      title={a.name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: a.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.2)',
      }}
    >
      {a.init}
    </div>
  );
}
