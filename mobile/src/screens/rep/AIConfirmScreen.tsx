// Nümayəndə → Qanunsuz tikinti təsdiqi (AI dayanacaqları). Sahə qərarı + əsaslandırma.
// Təsdiq → status=inprogress (inzibati proses); Rədd → decision=reject (ləğv + səbəb).
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { api } from '../../api/client';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useRepToast } from '../../navigation/repToast';
import type { RepNav, RepStackParamList } from '../../navigation/types';
import { FIELD } from './parts';

type Decision = 'confirm' | 'reject';

export function AIConfirmScreen() {
  const nav = useNavigation<RepNav>();
  const { stop } = useRoute<RouteProp<RepStackParamList, 'AIConfirm'>>().params;
  const { user } = useAuth();
  const toast = useRepToast();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const conf = stop.confidence ?? 0;

  const submit = async () => {
    if (!decision || !note.trim() || busy) return;
    setBusy(true);
    try {
      if (decision === 'confirm') {
        await api.advanceStatus(stop.id, { status: 'inprogress', actor: user?.userId, note: note.trim() });
        toast('Təsdiqləndi — inzibati proses başladı');
      } else {
        await api.decide(stop.id, { decision: 'reject', note: note.trim() });
        toast('Rədd edildi — qeyd saxlanıldı');
      }
      nav.goBack();
    } catch (e) {
      toast('Xəta: ' + (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.back} hitSlop={8}>
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ gap: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Qanunsuz tikinti təsdiqi</Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>{stop.id}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.aiCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <View style={styles.aiIcon}>
              <Icon name="scan-line" size={17} color="#fff" />
            </View>
            <View style={{ gap: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text }}>AI aşkarlama nəticəsi</Text>
              <Text style={{ fontSize: 11.5, color: '#92400E' }}>{stop.addr}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12.5, color: '#78350F' }}>Etibarlılıq dərəcəsi</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#B45309' }}>{conf}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${conf}%` }]} />
          </View>
        </View>

        <View style={styles.photo}>
          <Text style={styles.photoTag}>peyk + sahə foto</Text>
        </View>

        <Text style={styles.section}>
          SAHƏ QƏRARI <Text style={{ color: colors.danger }}>*</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => setDecision('confirm')}
            activeOpacity={0.8}
            style={[styles.seg, { borderColor: FIELD, backgroundColor: decision === 'confirm' ? FIELD : '#fff' }]}
          >
            <Icon name="check" size={17} color={decision === 'confirm' ? '#fff' : FIELD} />
            <Text style={[styles.segText, { color: decision === 'confirm' ? '#fff' : FIELD }]}>Təsdiq et</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDecision('reject')}
            activeOpacity={0.8}
            style={[styles.seg, { borderColor: colors.danger, backgroundColor: decision === 'reject' ? colors.danger : '#fff' }]}
          >
            <Icon name="x" size={17} color={decision === 'reject' ? '#fff' : colors.danger} />
            <Text style={[styles.segText, { color: decision === 'reject' ? '#fff' : colors.danger }]}>Rədd et</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          placeholder="Qərar əsaslandırması (məcburi)…"
          placeholderTextColor={colors.slate400}
          style={styles.textarea}
        />
      </ScrollView>

      <View style={styles.footer}>
        {!decision || !note.trim() ? (
          <Text style={styles.warn}>Qərar və əsaslandırma məcburidir</Text>
        ) : null}
        <TouchableOpacity
          onPress={submit}
          disabled={!decision || !note.trim() || busy}
          style={[styles.submit, { opacity: decision && note.trim() && !busy ? 1 : 0.5 }]}
          activeOpacity={0.9}
        >
          <Icon name="send" size={17} color="#fff" />
          <Text style={styles.submitText}>İnzibati prosesi başlat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  aiCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  aiIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.warning, alignItems: 'center', justifyContent: 'center' },
  barTrack: { height: 7, borderRadius: 999, backgroundColor: '#FDE68A', overflow: 'hidden', marginTop: 6 },
  barFill: { height: '100%', backgroundColor: colors.warning },
  photo: {
    borderRadius: 14,
    overflow: 'hidden',
    aspectRatio: 16 / 10,
    backgroundColor: colors.slate200,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  photoTag: {
    fontSize: 10,
    color: colors.slate500,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    margin: 8,
    borderRadius: 5,
    overflow: 'hidden',
  },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, color: colors.muted },
  seg: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  segText: { fontSize: 14, fontWeight: '700' },
  textarea: {
    minHeight: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    fontSize: 13.5,
    color: colors.text,
    textAlignVertical: 'top',
  },
  footer: { padding: 14, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 },
  warn: { fontSize: 11, color: '#B45309', textAlign: 'center' },
  submit: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.slate900,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: { color: '#fff', fontSize: 14.5, fontWeight: '700' },
});
