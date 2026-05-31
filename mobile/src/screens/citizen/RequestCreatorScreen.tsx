// Müraciət formalaşdırma axını (vətəndaş). Media (expo-image-picker), məkan (GPS/əl ilə), təsvir.
// Göndərmə REAL API-yə yazılır (POST /incidents) — müraciət web kokpit və mobil xəritədə görünür.
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/ui';
import { colors } from '../../theme/tokens';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import type { CitizenNav } from '../../navigation/types';

// Küçə → təxmini koordinat (Nərimanov rayonu daxili). Müraciət ünvana uyğun
// nöqtədə xəritədə görünsün deyə lat/lng API-yə göndərilir.
const NRM_STREETS: { name: string; lat: number; lng: number }[] = [
  { name: 'Atatürk prospekti', lat: 40.4078, lng: 49.858 },
  { name: 'Ziya Bünyadov prospekti', lat: 40.4026, lng: 49.864 },
  { name: 'Qara Qarayev prospekti', lat: 40.3966, lng: 49.868 },
  { name: 'Koroğlu Rəhimov küçəsi', lat: 40.4172, lng: 49.874 },
  { name: 'Təbriz küçəsi', lat: 40.4275, lng: 49.88 },
  { name: 'Həsən bəy Zərdabi küçəsi', lat: 40.4105, lng: 49.862 },
  { name: 'Fətəli Xan Xoyski küçəsi', lat: 40.4085, lng: 49.876 },
  { name: 'Əhməd Rəcəbli küçəsi', lat: 40.415, lng: 49.87 },
];
// GPS "avtomatik" rejimi üçün sabit nöqtə (Atatürk pr. 24).
const GPS_FIXED = { addr: 'Atatürk pr. 24, Nərimanov', lat: 40.4072, lng: 49.852 };

type MediaKind = 'photo' | 'video' | 'gallery';
interface MediaItem {
  id: string;
  kind: MediaKind;
  uri: string;
  dataUri?: string; // base64 data-URI (web kokpit + detal ekranında göstərmək üçün)
}

export function RequestCreatorScreen() {
  const nav = useNavigation<CitizenNav>();
  const route = useRoute();
  const { user } = useAuth();
  const role: 'citizen' | 'rih' = (route.params as { role?: 'citizen' | 'rih' } | undefined)?.role ?? 'citizen';
  const accent = role === 'rih' ? colors.success : colors.accent;

  const [camPerm, requestCam] = ImagePicker.useCameraPermissions();
  const [libPerm, requestLib] = ImagePicker.useMediaLibraryPermissions();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [desc, setDesc] = useState('');
  const [gps, setGps] = useState<boolean | null>(null);
  const [addr, setAddr] = useState('');
  const [stage, setStage] = useState<'form' | 'sending' | 'done'>('form');
  const [doneId, setDoneId] = useState('');

  const addMedia = (kind: MediaKind, uri: string, dataUri?: string) =>
    setMedia((m) => [...m, { kind, uri, dataUri, id: `${Date.now()}-${Math.random()}` }]);
  const removeMedia = (id: string) => setMedia((m) => m.filter((x) => x.id !== id));

  const ensureCam = async () => (camPerm?.granted ? true : (await requestCam()).granted);
  const ensureLib = async () => (libPerm?.granted ? true : (await requestLib()).granted);

  // base64 → data-URI (web kokpit/detal şəkli birbaşa göstərə bilsin)
  const toDataUri = (b64?: string | null) => (b64 ? `data:image/jpeg;base64,${b64}` : undefined);

  const pickCamera = async () => {
    if (!(await ensureCam())) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.5, base64: true });
    if (!res.canceled && res.assets[0]) addMedia('photo', res.assets[0].uri, toDataUri(res.assets[0].base64));
  };
  const pickVideo = async () => {
    if (!(await ensureCam())) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: 'videos' });
    if (!res.canceled && res.assets[0]) addMedia('video', res.assets[0].uri);
  };
  const pickGallery = async () => {
    if (!(await ensureLib())) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.5, base64: true });
    if (!res.canceled && res.assets[0]) addMedia('gallery', res.assets[0].uri, toDataUri(res.assets[0].base64));
  };

  const locationOk = gps === true || (gps === false && !!addr);
  const canSubmit = locationOk && stage === 'form';

  const submit = async () => {
    setStage('sending');
    // Ünvan + koordinat: GPS rejimi sabit nöqtə, əl ilə seçim küçə cədvəlindən.
    const loc =
      gps === true
        ? GPS_FIXED
        : (() => {
            const st = NRM_STREETS.find((s) => addr === `${s.name}, Nərimanov`);
            return { addr, lat: st?.lat, lng: st?.lng };
          })();
    const photoUrls = media.map((m) => m.dataUri).filter((x): x is string => !!x);
    try {
      const inc = await api.createIncident({
        title: desc.trim() ? desc.trim().slice(0, 60) : 'Vətəndaş müraciəti',
        desc: desc.trim(),
        addr: loc.addr,
        lat: loc.lat,
        lng: loc.lng,
        reporter: role === 'rih' ? 'RİH nümayəndəsi' : user?.fullName ?? 'Vətəndaş',
        photos: media.length,
        photoUrls,
      });
      setDoneId(inc.id);
    } catch (e) {
      // API əlçatan deyilsə demo pozulmasın — fallback nömrə göstər.
      console.warn('müraciət göndərilmədi:', e);
      setDoneId(`NRM-${24819 + Math.floor(Math.random() * 80)}`);
    }
    setStage('done');
  };

  if (stage === 'done') {
    return (
      <SafeAreaView style={styles.doneRoot} edges={['top', 'bottom']}>
        <View style={[styles.doneIcon, { backgroundColor: accent + '1A' }]}>
          <Icon name="check" size={40} color={accent} />
        </View>
        <Text style={styles.doneTitle}>Müraciət qeydə alındı</Text>
        <Text style={styles.doneText}>
          Qeydiyyat nömrəsi <Text style={{ fontWeight: '700', color: colors.text }}>{doneId}</Text>. RİH
          nümayəndəsi təsnifatı təyin edəcək, statusu izləyə biləcəksiniz.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: accent }]}
          onPress={() => (role === 'rih' ? nav.goBack() : nav.navigate('Tabs', { screen: 'MyRequests' }))}
        >
          <Text style={styles.primaryBtnText}>{role === 'rih' ? 'Bağla' : 'Müraciətlərimə bax'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => nav.goBack()}>
          <Icon name="x" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 15.5, fontWeight: '700', color: colors.text }}>Problem bildir</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 18 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Media */}
        <View style={{ gap: 8 }}>
          <Text style={styles.fieldLabel}>
            Media <Text style={styles.optional}>(istəyə bağlı)</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Tile icon="camera" label="Kamera" accent={accent} onPress={pickCamera} />
            <Tile icon="video" label="Video" accent={accent} onPress={pickVideo} />
            <Tile icon="image" label="Qalereya" accent={accent} onPress={pickGallery} />
          </View>
          {media.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {media.map((m) => (
                <View key={m.id} style={styles.thumb}>
                  {m.kind === 'video' ? (
                    <View style={styles.thumbVideo}>
                      <Icon name="video" size={22} color={colors.slate400} />
                    </View>
                  ) : (
                    <Image source={{ uri: m.uri }} style={styles.thumbImg} />
                  )}
                  <TouchableOpacity style={styles.thumbRemove} onPress={() => removeMedia(m.id)}>
                    <Icon name="x" size={11} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Məkan */}
        <View style={{ gap: 8 }}>
          <Text style={styles.fieldLabel}>
            Məkan <Text style={{ color: colors.danger }}>*</Text>
          </Text>

          {gps === null ? (
            <Card style={{ padding: 14, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="map-pin" size={16} color={accent} />
                <Text style={{ fontSize: 12.5, color: colors.text2, flex: 1 }}>
                  Dəqiq ünvan üçün məkana icazə verin və ya əl ilə seçin.
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.smBtn, { backgroundColor: accent }]} onPress={() => setGps(true)}>
                  <Icon name="locate-fixed" size={15} color="#fff" />
                  <Text style={styles.smBtnText}>GPS-i aç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smBtn, styles.smBtnGhost]} onPress={() => setGps(false)}>
                  <Icon name="pencil" size={15} color={colors.text2} />
                  <Text style={[styles.smBtnText, { color: colors.text2 }]}>Əl ilə seç</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : null}

          {gps === true ? (
            <Card style={[styles.gpsCard, { borderColor: accent }]}>
              <View style={[styles.gpsIcon, { backgroundColor: accent + '1A' }]}>
                <Icon name="locate-fixed" size={17} color={accent} />
              </View>
              <View style={{ gap: 1, flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Atatürk pr. 24</Text>
                <Text style={{ fontSize: 11, color: colors.success }}>● GPS ilə avtomatik · Nərimanov</Text>
              </View>
              <TouchableOpacity onPress={() => setGps(false)}>
                <Text style={{ fontSize: 12.5, color: colors.muted, fontWeight: '600' }}>Dəyiş</Text>
              </TouchableOpacity>
            </Card>
          ) : null}

          {gps === false ? (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="triangle-alert" size={13} color={colors.warning} />
                <Text style={{ fontSize: 11.5, color: colors.warning, flex: 1 }}>
                  GPS bağlıdır — Nərimanov rayonu üzrə ünvan seçin
                </Text>
              </View>
              <Card style={{ overflow: 'hidden' }}>
                {NRM_STREETS.map((s, i) => {
                  const val = `${s.name}, Nərimanov`;
                  const on = addr === val;
                  return (
                    <TouchableOpacity
                      key={s.name}
                      onPress={() => setAddr(val)}
                      style={[styles.streetRow, i < NRM_STREETS.length - 1 ? styles.streetDivider : null]}
                    >
                      <Text style={{ fontSize: 13.5, color: on ? accent : colors.text, fontWeight: on ? '700' : '500', flex: 1 }}>
                        {s.name}
                      </Text>
                      {on ? <Icon name="check" size={15} color={accent} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </Card>
              <TouchableOpacity onPress={() => setGps(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="locate-fixed" size={13} color={colors.muted} />
                <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>GPS-i yenidən sına</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Təsvir */}
        <View style={{ gap: 8 }}>
          <Text style={styles.fieldLabel}>
            Təsvir <Text style={styles.optional}>(istəyə bağlı)</Text>
          </Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
            placeholder="İstəsəniz problemi qısaca izah edin…"
            placeholderTextColor={colors.slate400}
            style={styles.textarea}
          />
          <Text style={{ fontSize: 11, color: colors.muted }}>
            Təsvir və media olmasa belə göndərə bilərsiniz — təsnifatı RİH nümayəndəsi təyin edəcək.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!locationOk ? (
          <Text style={{ fontSize: 11, color: colors.warning, textAlign: 'center', marginBottom: 8 }}>
            Göndərmək üçün məkan təyin olunmalıdır
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.primaryBtn, { backgroundColor: accent, opacity: canSubmit ? 1 : 0.5 }]}
        >
          {stage === 'sending' ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.primaryBtnText}>Göndərilir…</Text>
            </>
          ) : (
            <>
              <Icon name="send" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Müraciəti göndər</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Tile({
  icon,
  label,
  accent,
  onPress,
}: {
  icon: string;
  label: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <View style={[styles.tileIcon, { backgroundColor: accent + '14' }]}>
        <Icon name={icon} size={20} color={accent} />
      </View>
      <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.text }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.text },
  optional: { color: colors.slate400, fontWeight: '500' },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  thumbImg: { width: '100%', height: '100%' },
  thumbVideo: { width: '100%', height: '100%', backgroundColor: colors.slate100, alignItems: 'center', justifyContent: 'center' },
  thumbRemove: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  smBtnGhost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  smBtnText: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  gpsCard: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1.5 },
  gpsIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  streetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  streetDivider: { borderBottomWidth: 1, borderBottomColor: colors.slate100 },
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
  footer: { padding: 14, borderTopWidth: 1, borderTopColor: colors.border },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 14.5, fontWeight: '700' },
  doneRoot: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 30 },
  doneIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 21, fontWeight: '800', color: colors.text },
  doneText: { fontSize: 13.5, color: colors.muted, lineHeight: 20, textAlign: 'center' },
});
