// Nümayəndə → Marşrutum. Aktiv sahə müraciətləri (API) = dayanacaqlar.
// 180px Leaflet marşrut xəritəsi (polyline + nömrəli markerlər) + sıralanabilən siyahı + "Müraciət yarat" FAB.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { api } from '../../api/client';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/tokens';
import type { RepNav } from '../../navigation/types';
import { ACTIVE_FIELD_STATUSES, toStop } from '../../data/repTasks';
import type { RepStop } from '../../data/repTasks';
import { FIELD, FIELD_DARK, FIELD_LIGHT, PrioTag } from './parts';

const RANK: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

function repRouteHtml(stops: RepStop[]): string {
  const data = stops.map((s, i) => ({ lat: s.lat, lng: s.lng, n: i + 1, active: i === 0 }));
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;background:#EAEFF3}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var STOPS=${JSON.stringify(data)};
var map=L.map('map',{center:[40.411,49.852],zoom:13,zoomControl:false,attributionControl:false});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',detectRetina:true}).addTo(map);
var line=STOPS.map(function(s){return [s.lat,s.lng];});
if(line.length>1){L.polyline(line,{color:'${FIELD}',weight:3,dashArray:'6 6',opacity:0.7}).addTo(map);}
STOPS.forEach(function(s,i){
  var c=s.active?'${FIELD}':'#64748B';
  var m=L.marker([s.lat,s.lng],{icon:L.divIcon({className:'',html:'<div style="width:26px;height:26px;border-radius:50%;background:'+c+';border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px">'+s.n+'</div>',iconSize:[26,26],iconAnchor:[13,13]})});
  m.on('click',function(){if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({type:'stop',i:i}));}});
  m.addTo(map);
});
try{ if(line.length){map.fitBounds(L.latLngBounds(line),{padding:[34,34]});} }catch(e){}
setTimeout(function(){map.invalidateSize();},120);
</script></body></html>`;
}

export function RouteScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<RepNav>();
  const webRef = useRef<WebView>(null);
  const [stops, setStops] = useState<RepStop[]>([]);
  const [done, setDone] = useState(0);
  const [html, setHtml] = useState<string>(() => repRouteHtml([]));

  const load = useCallback(() => {
    api
      .incidents()
      .then((all) => {
        const active = all.filter((i) => ACTIVE_FIELD_STATUSES.includes(i.status));
        active.sort((a, b) => (RANK[a.priority] ?? 9) - (RANK[b.priority] ?? 9));
        setStops(active.map(toStop));
        setDone(all.filter((i) => i.status === 'resolved' || i.status === 'archived').length);
      })
      .catch(() => {
        setStops([]);
        setDone(0);
      });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { setHtml(repRouteHtml(stops)); }, [stops]);

  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= stops.length) return;
    const n = [...stops];
    [n[i], n[j]] = [n[j], n[i]];
    setStops(n);
  };

  const openStop = (s: RepStop) =>
    nav.navigate(s.type === 'ai' ? 'AIConfirm' : 'StopDetail', { stop: s });

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const d = JSON.parse(e.nativeEvent.data) as { type: string; i: number };
      if (d.type === 'stop' && stops[d.i]) openStop(stops[d.i]);
    } catch {
      /* yararsız mesaj */
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 2 }}>
            <Text style={styles.hSub}>Marşrutum · 30 May</Text>
            <Text style={styles.hTitle}>{stops.length} dayanacaq</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.hStatV}>{done}</Text>
              <Text style={styles.hStatL}>tamamlandı</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.hStatV}>~14km</Text>
              <Text style={styles.hStatL}>məsafə</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 180 }}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={onMessage}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Dayanacaqlar</Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Sıranı dəyiş ↑↓</Text>
        </View>

        {stops.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 8 }}>
            <Icon name="check-check" size={28} color={colors.slate400} />
            <Text style={{ fontSize: 13, color: colors.muted }}>Aktiv dayanacaq yoxdur</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {stops.map((s, i) => (
              <View key={s.id} style={[styles.stopCard, { borderLeftColor: i === 0 ? FIELD : colors.border }]}>
                <View style={{ gap: 2 }}>
                  <TouchableOpacity onPress={() => move(i, -1)} disabled={i === 0} hitSlop={6}>
                    <Icon name="chevron-up" size={16} color={i === 0 ? colors.slate300 : colors.slate500} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => move(i, 1)} disabled={i === stops.length - 1} hitSlop={6}>
                    <Icon name="chevron-down" size={16} color={i === stops.length - 1 ? colors.slate300 : colors.slate500} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={{ flex: 1, gap: 5 }} onPress={() => openStop(s)} activeOpacity={0.7}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.num, { backgroundColor: i === 0 ? FIELD : colors.slate200 }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: i === 0 ? '#fff' : colors.slate600 }}>{i + 1}</Text>
                    </View>
                    <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: '600', color: colors.text, flex: 1 }}>
                      {s.title}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <PrioTag p={s.prio} />
                    {s.type === 'ai' ? (
                      <View style={styles.aiTag}>
                        <Text style={styles.aiTagText}>AI {s.confidence}%</Text>
                      </View>
                    ) : null}
                    <Text style={{ fontSize: 11.5, color: colors.muted }}>{s.addr}</Text>
                  </View>
                </TouchableOpacity>

                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{s.eta}</Text>
                  <Icon name="chevron-right" size={16} color={colors.slate300} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => nav.navigate('RequestCreator', { role: 'rih' })}
        activeOpacity={0.9}
      >
        <Icon name="plus" size={19} color="#fff" />
        <Text style={styles.fabText}>Müraciət yarat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingBottom: 14, backgroundColor: FIELD_DARK },
  hSub: { fontSize: 12.5, color: FIELD_LIGHT },
  hTitle: { fontSize: 19, fontWeight: '800', color: '#fff' },
  hStatV: { fontSize: 16, fontWeight: '800', color: '#fff' },
  hStatL: { fontSize: 10, color: FIELD_LIGHT },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
  },
  num: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  aiTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  aiTagText: { fontSize: 10.5, fontWeight: '700', color: '#B45309' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FIELD,
    shadowColor: FIELD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
});
