// İnisiallı dairəvi avatar — rəng API-dən gəlir.
export function Avatar({ init, color, size = 34 }: { init: string; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {init}
    </div>
  );
}
