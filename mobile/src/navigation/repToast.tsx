// Nümayəndə tətbiqi üçün app-səviyyəli toast (dizayndakı RepApp toast-ının RN qarşılığı).
// RepNavigator bunu Stack üzərinə sarıyır; ekranlar useRepToast() ilə mesaj göstərir.
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';

type ShowFn = (msg: string) => void;
const Ctx = createContext<ShowFn>(() => {});
export const useRepToast = () => useContext(Ctx);

export function RepToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 3000);
  }, []);

  return (
    <Ctx.Provider value={show}>
      <View style={{ flex: 1 }}>
        {children}
        {msg ? (
          <View style={styles.toast} pointerEvents="none">
            <Icon name="check-circle" size={17} color="#34D399" />
            <Text style={styles.toastText}>{msg}</Text>
          </View>
        ) : null}
      </View>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 96,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastText: { color: '#fff', fontSize: 12.5, fontWeight: '500', flex: 1 },
});
