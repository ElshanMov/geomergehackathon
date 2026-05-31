import 'react-native-gesture-handler';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Feather } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { CitizenNavigator } from './src/navigation/CitizenNavigator';
import { RepNavigator } from './src/navigation/RepNavigator';
import { colors } from './src/theme/tokens';

function Root() {
  const { user, ready } = useAuth();
  // İkon şriftini (Feather) əvvəlcədən yüklə — web/Vercel export-da @font-face
  // avtomatik yaranır və ikonlar görünür (əks halda ilk renderdə boş qalırdı).
  const [fontsLoaded] = useFonts(Feather.font);
  if (!ready || !fontsLoaded) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!user) return <AuthScreen />;
  const Navigator = user.role === 'citizen' ? CitizenNavigator : RepNavigator;
  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Root />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
});
