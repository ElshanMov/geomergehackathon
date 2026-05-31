// Platforma-spesifik xəritə körpüsü (WEB). react-native-webview web-də işləmir,
// ona görə <iframe srcDoc> ilə eyni HTML render olunur. Körpü:
//  • injectJavaScript → iframe.contentWindow.eval (srcDoc same-origin olduğundan işləyir)
//  • window.ReactNativeWebView.postMessage shim → parent-ə postMessage
//  • parent message dinləyicisi → onMessage(data)
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

export interface MapWebViewHandle {
  injectJavaScript: (js: string) => void;
}

export interface MapWebViewProps {
  html: string;
  onMessage?: (data: string) => void;
  onLoadEnd?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const MapWebView = forwardRef<MapWebViewHandle, MapWebViewProps>(
  ({ html, onMessage, onLoadEnd, style }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useImperativeHandle(ref, () => ({
      injectJavaScript: (js: string) => {
        const win = iframeRef.current?.contentWindow as
          | (Window & { eval: (s: string) => void })
          | null
          | undefined;
        try {
          win?.eval(js);
        } catch {
          /* iframe hələ hazır deyil */
        }
      },
    }));

    const handleLoad = () => {
      const win = iframeRef.current?.contentWindow as
        | (Window & { eval: (s: string) => void })
        | null
        | undefined;
      // RN WebView körpüsünü iframe daxilində qur: postMessage → parent.
      try {
        win?.eval(
          "window.ReactNativeWebView={postMessage:function(s){window.parent.postMessage(String(s),'*');}};",
        );
      } catch {
        /* ehtiyat */
      }
      // Parent message dinləyicisi (yalnız bu iframe-dən gələnlər).
      const listener = (ev: MessageEvent) => {
        if (ev.source && ev.source === iframeRef.current?.contentWindow) {
          onMessage?.(typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data));
        }
      };
      window.addEventListener('message', listener);
      onLoadEnd?.();
    };

    return (
      <View style={[{ overflow: 'hidden' }, style]}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          onLoad={handleLoad}
          title="map"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </View>
    );
  },
);

MapWebView.displayName = 'MapWebView';
