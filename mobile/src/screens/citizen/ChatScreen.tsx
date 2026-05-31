// Vətəndaş → Nümayəndə ilə yazışma. API conversation (incidentId-ə görə) + mesaj göndərmə.
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { api } from '../../api/client';
import type { Conversation, Message } from '../../api/types';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/tokens';
import type { CitizenNav, CitizenStackParamList } from '../../navigation/types';

export function ChatScreen() {
  const nav = useNavigation<CitizenNav>();
  const route = useRoute<RouteProp<CitizenStackParamList, 'Chat'>>();
  const incidentId = route.params?.incidentId;
  const [conv, setConv] = useState<Conversation | null>(null);
  const [txt, setTxt] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    api
      .conversations()
      .then((list) => {
        const found = incidentId ? list.find((c) => c.incidentId === incidentId) : undefined;
        setConv(found ?? list[0] ?? null);
      })
      .catch(() => setConv(null));
  }, [incidentId]);

  const send = async () => {
    const body = txt.trim();
    if (!body || !conv) return;
    setTxt('');
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      sender: 'citizen',
      text: body,
      t: 'indi',
      channel: 'app',
    };
    setConv({ ...conv, messages: [...conv.messages, optimistic] });
    try {
      const updated = await api.sendMessage(conv.id, { text: body, sender: 'citizen', channel: 'app' });
      setConv(updated);
    } catch {
      /* offline — optimistik mesaj qalır */
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => nav.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.repAvatar}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>EH</Text>
        </View>
        <View style={{ gap: 0 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Elçin Hüseynov</Text>
          <Text style={{ fontSize: 11, color: colors.success }}>● RİH nümayəndəsi · onlayn</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {conv === null ? (
            <Text style={styles.muted}>Yüklənir…</Text>
          ) : (
            conv.messages.map((m) => {
              const me = m.sender === 'citizen';
              return (
                <View key={m.id} style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
                  <View
                    style={[
                      styles.bubble,
                      me ? styles.bubbleMe : styles.bubbleThem,
                    ]}
                  >
                    <Text style={{ fontSize: 13.5, lineHeight: 19, color: me ? '#fff' : colors.text }}>
                      {m.text}
                    </Text>
                  </View>
                  <Text style={[styles.time, { textAlign: me ? 'right' : 'left' }]}>{m.t}</Text>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={txt}
            onChangeText={setTxt}
            placeholder="Mesaj yazın…"
            placeholderTextColor={colors.slate400}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Icon name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  repAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: { fontSize: 13, color: colors.muted },
  bubble: { paddingHorizontal: 13, paddingVertical: 9 },
  bubbleMe: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  time: { fontSize: 10, color: colors.slate400, marginTop: 3 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
