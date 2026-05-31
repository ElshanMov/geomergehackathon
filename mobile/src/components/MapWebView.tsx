// Platforma-spesifik xəritə körpüsü (NATİV). react-native-webview-i sarıyır.
// Web build üçün MapWebView.web.tsx avtomatik seçilir (Metro platform resolution).
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

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
    const webRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      injectJavaScript: (js: string) => {
        webRef.current?.injectJavaScript(js);
      },
    }));

    return (
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={(e: WebViewMessageEvent) => onMessage?.(e.nativeEvent.data)}
        onLoadEnd={() => onLoadEnd?.()}
        style={style}
        javaScriptEnabled
        domStorageEnabled
      />
    );
  },
);

MapWebView.displayName = 'MapWebView';
