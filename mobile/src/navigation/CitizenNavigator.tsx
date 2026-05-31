// Vətəndaş naviqasiyası: native-stack {Tabs, RequestDetail, Chat, RequestCreator(modal)}
// + bottom-tab xüsusi tabBar (mərkəzdə "+" FAB → RequestCreator).
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/Icon';
import { colors } from '../theme/tokens';
import type { CitizenStackParamList, CitizenTabParamList } from './types';
import { HomeScreen } from '../screens/citizen/HomeScreen';
import { MyRequestsScreen } from '../screens/citizen/MyRequestsScreen';
import { MapScreen } from '../screens/citizen/MapScreen';
import { ProfileScreen } from '../screens/citizen/ProfileScreen';
import { RequestDetailScreen } from '../screens/citizen/RequestDetailScreen';
import { ChatScreen } from '../screens/citizen/ChatScreen';
import { RequestCreatorScreen } from '../screens/citizen/RequestCreatorScreen';

const ICONS: Record<string, string> = { Home: 'house', MyRequests: 'file-text', Map: 'map', Profile: 'user' };
const LABELS: Record<string, string> = {
  Home: 'Ana',
  MyRequests: 'Müraciətlərim',
  Map: 'Xəritə',
  Profile: 'Profil',
};

function CitizenTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const renderItem = (index: number) => {
    const route = state.routes[index];
    const focused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    const tint = focused ? colors.accent600 : colors.slate400;
    return (
      <TouchableOpacity key={route.key} style={styles.item} onPress={onPress} activeOpacity={0.7}>
        <Icon name={ICONS[route.name]} size={22} color={tint} />
        <Text style={[styles.label, { color: tint, fontWeight: focused ? '700' : '500' }]}>
          {LABELS[route.name]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
      {renderItem(0)}
      {renderItem(1)}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('RequestCreator')} activeOpacity={0.85}>
        <Icon name="plus" size={26} color="#fff" />
      </TouchableOpacity>
      {renderItem(2)}
      {renderItem(3)}
    </View>
  );
}

const Tab = createBottomTabNavigator<CitizenTabParamList>();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CitizenTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyRequests" component={MyRequestsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator<CitizenStackParamList>();

export function CitizenNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="RequestCreator" component={RequestCreatorScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  item: { alignItems: 'center', gap: 3, width: 64 },
  label: { fontSize: 10 },
  fab: {
    marginTop: -22,
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
});
