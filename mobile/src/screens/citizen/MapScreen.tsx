// Vətəndaş → Xəritə. Leaflet (WebView) + Nərimanov maskası + yaxınlıqdakı problem pinləri.
// Pinə/siyahıya toxunuş → detal kartı; RN overlay-lər WebView üstündə render olunur.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import type { GeoJsonLike, Incident, NearbyProblem, Priority } from '../../api/types';
import { NRM_BOUNDARY } from '../../data/meta';
import { Icon } from '../../components/Icon';
import { MapWebView } from '../../components/MapWebView';
import type { MapWebViewHandle } from '../../components/MapWebView';
import { Card, NeutralBadge } from '../../components/ui';
import { colors } from '../../theme/tokens';

function extractRing(gj: GeoJsonLike): number[][] {
  const g = gj.features?.[0]?.geometry ?? gj.geometry;
  if (!g) return NRM_BOUNDARY;
  if (g.type === 'MultiPolygon') return (g.coordinates as number[][][][])[0][0];
  return (g.coordinates as number[][][])[0];
}

// Müraciət pininin rəngi prioritetə görə (canlı incident layer).
const PRIO_COLOR: Record<Priority, string> = {
  urgent: colors.danger,
  high: colors.warning,
  normal: colors.accent,
  low: colors.slate400,
};

function mapHtml(ring: number[][], pins: NearbyProblem[]): string {
  const pinData = pins.map((p) => ({ lat: p.lat, lng: p.lng, color: p.color }));
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;background:#EAEFF3}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var RING=${JSON.stringify(ring)};
var PINS=${JSON.stringify(pinData)};
var map=L.map('map',{center:[40.40985,49.87094],zoom:13,zoomControl:false,attributionControl:false});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',detectRetina:true}).addTo(map);
var hole=RING.map(function(c){return [c[1],c[0]];});
var world=[[-90,-180],[-90,180],[90,180],[90,-180]];
L.polygon([world,hole],{fillColor:'#0A1220',fillOpacity:0.30,stroke:false,interactive:false}).addTo(map);
L.polygon(hole,{fill:false,color:'#0EA5E9',weight:2.4,opacity:0.95,dashArray:'6 5',interactive:false}).addTo(map);
try{map.fitBounds(L.polygon(hole).getBounds(),{padding:[24,24]});}catch(e){}
PINS.forEach(function(n,i){
  var m=L.marker([n.lat,n.lng],{icon:L.divIcon({className:'',html:'<span style="display:block;width:20px;height:20px;border-radius:50%;background:'+n.color+';border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',iconSize:[20,20],iconAnchor:[10,10]})});
  m.on('click',function(){map.flyTo([n.lat,n.lng],15,{duration:0.6});if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({type:'pin',i:i}));}});
  m.addTo(map);
});
L.marker([40.4072,49.8540],{icon:L.divIcon({className:'',html:'<div style="width:20px;height:20px;border-radius:50%;background:#0EA5E9;border:3px solid #fff;box-shadow:0 0 0 6px rgba(14,165,233,.25)"></div>',iconSize:[20,20],iconAnchor:[10,10]})}).addTo(map);
var incLayer=L.layerGroup().addTo(map);
function setIncidents(arr){
  incLayer.clearLayers();
  arr.forEach(function(n){
    L.marker([n.lat,n.lng],{icon:L.divIcon({className:'',html:'<span style="display:block;width:16px;height:16px;border-radius:50%;background:'+n.color+';border:2px solid #fff;box-shadow:0 0 0 4px '+n.color+'33"></span>',iconSize:[16,16],iconAnchor:[8,8]})}).addTo(incLayer);
  });
}
function flyTo(lat,lng){map.flyTo([lat,lng],15,{duration:0.6});}
setTimeout(function(){map.invalidateSize();},150);
</script></body></html>`;
}

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const webRef = useRef<MapWebViewHandle>(null);
  const readyRef = useRef(false);
  const incidentsRef = useRef<Incident[]>([]);
  const [nearby, setNearby] = useState<NearbyProblem[]>([]);
  const [html, setHtml] = useState<string | null>(null);
  const [detail, setDetail] = useState<NearbyProblem | null>(null);
  const [stillThere, setStillThere] = useState(false);

  // Canlı müraciət pinlərini WebView-ə inject et (HTML yenidən qurulmur — flicker yoxdur).
  const injectIncidents = () => {
    if (!readyRef.current || !webRef.current) return;
    const data = incidentsRef.current
      .filter((i) => i.status !== 'archived' && i.status !== 'cancelled')
      .map((i) => ({ lat: i.lat, lng: i.lng, color: PRIO_COLOR[i.priority] ?? colors.accent }));
    webRef.current.injectJavaScript(`setIncidents(${JSON.stringify(data)}); true;`);
  };

  // Canlı sinxron: müraciətlər ilk yüklə + hər 8 saniyədə bir — web/mobil/admin-də
  // yaradılan yeni müraciət bu xəritədə də görünsün.
  useEffect(() => {
    const load = () =>
      api
        .incidents()
        .then((list) => {
          incidentsRef.current = list;
          injectIncidents();
        })
        .catch(() => undefined);
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let ring = NRM_BOUNDARY;
    Promise.all([
      api.nearby().catch(() => [] as NearbyProblem[]),
      api
        .geoBoundary()
        .then((gj) => {
          ring = extractRing(gj);
        })
        .catch(() => undefined),
    ]).then(([pins]) => {
      setNearby(pins);
      setHtml(mapHtml(ring, pins));
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setStillThere(true), 3200);
    return () => clearTimeout(t);
  }, []);

  const onMessage = (raw: string) => {
    try {
      const data = JSON.parse(raw) as { type: string; i: number };
      if (data.type === 'pin') setDetail(nearby[data.i] ?? null);
    } catch {
      /* yararsız mesaj */
    }
  };

  const flyTo = (n: NearbyProblem) => {
    setDetail(n);
    webRef.current?.injectJavaScript(`flyTo(${n.lat},${n.lng}); true;`);
  };

  return (
    <View style={{ flex: 1 }}>
      {html ? (
        <MapWebView
          ref={webRef}
          html={html}
          onMessage={onMessage}
          onLoadEnd={() => {
            readyRef.current = true;
            injectIncidents();
          }}
          style={{ flex: 1 }}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#EAEFF3' }} />
      )}

      {/* Axtarış paneli */}
      <View style={[styles.searchWrap, { top: insets.top + 12 }]}>
        <Card style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.slate400} />
          <Text style={{ fontSize: 13, color: colors.muted }}>Yaxınlıqda axtar…</Text>
        </Card>
      </View>

      {/* "Hələ də oradadır?" */}
      {stillThere && !detail ? (
        <Card style={[styles.stillCard, { top: insets.top + 64 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={styles.stillIcon}>
              <Icon name="map-pin" size={15} color={colors.danger} />
            </View>
            <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text }}>
              Bu problem hələ də oradadır?
            </Text>
          </View>
          <Text style={{ fontSize: 12.5, color: colors.muted, marginBottom: 10 }}>
            Yaxınlığınızda problem bildirilib. Təsdiqləməyiniz icraya kömək edir.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.smBtn, { backgroundColor: colors.accent }]} onPress={() => setStillThere(false)}>
              <Text style={styles.smBtnText}>Bəli, oradadır</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smBtn, styles.smBtnGhost]} onPress={() => setStillThere(false)}>
              <Text style={[styles.smBtnText, { color: colors.text2 }]}>Həll olunub</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : null}

      {/* Detal kartı */}
      {detail ? (
        <Card style={styles.detailCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
              <View style={[styles.detailIcon, { backgroundColor: detail.color + '1A' }]}>
                <Icon name={detail.icon} size={18} color={detail.color} />
              </View>
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{detail.title}</Text>
                <Text style={{ fontSize: 11.5, color: colors.muted }}>
                  {detail.addr} · {detail.distanceM} m
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setDetail(null)} style={styles.iconBtn}>
              <Icon name="x" size={17} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <View style={{ marginBottom: 12 }}>
            <NeutralBadge>Açıq</NeutralBadge>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.smBtn, { backgroundColor: colors.accent }]}>
              <Icon name="thumbs-up" size={15} color="#fff" />
              <Text style={styles.smBtnText}>Mən də görürəm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smBtn, styles.smBtnGhost]}>
              <Icon name="bell" size={15} color={colors.text2} />
              <Text style={[styles.smBtnText, { color: colors.text2 }]}>İzlə</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        /* Bottom sheet */
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Yaxınlıqdakı problemlər</Text>
            <Text style={{ fontSize: 11.5, color: colors.muted }}>Detal üçün toxun</Text>
          </View>
          {nearby.map((n, i) => (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.6}
              onPress={() => flyTo(n)}
              style={[styles.sheetRow, i < nearby.length - 1 ? styles.sheetDivider : null]}
            >
              <View style={[styles.sheetIcon, { backgroundColor: n.color + '1A' }]}>
                <Icon name={n.icon} size={16} color={n.color} />
              </View>
              <View style={{ gap: 1, flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.text }}>{n.title}</Text>
                <Text style={{ fontSize: 11.5, color: colors.muted }}>
                  {n.distanceM} m · {n.addr}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.slate300} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { position: 'absolute', left: 16, right: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  stillCard: { position: 'absolute', left: 16, right: 16, padding: 14 },
  stillIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.danger50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCard: { position: 'absolute', left: 12, right: 12, bottom: 12, padding: 16 },
  detailIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
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
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    maxHeight: '46%',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8 },
  sheetDivider: { borderBottomWidth: 1, borderBottomColor: colors.slate100 },
  sheetIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
