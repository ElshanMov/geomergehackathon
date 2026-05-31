// Nümayəndə naviqasiyası: RepToastProvider → native-stack {RepTabs, StopDetail, AIConfirm, RequestCreator(modal)}.
// RepTabs = 3 tablı xüsusi bottom bar (Marşrut/Tarixçə/Profil), aktiv rəng = emerald.
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from '../components/Icon';
import { colors } from '../theme/tokens';
import { FIELD } from '../screens/rep/parts';
import { RouteScreen } from '../screens/rep/RouteScreen';
import { HistoryScreen } from '../screens/rep/HistoryScreen';
import { RepProfileScreen } from '../screens/rep/ProfileScreen';
import { StopDetailScreen } from '../screens/rep/StopDetailScreen';
import { AIConfirmScreen } from '../screens/rep/AIConfirmScreen';
import { RequestCreatorScreen } from '../screens/citizen/RequestCreatorScreen';
import { RepToastProvider } from './repToast';
import type { RepStackParamList, RepTabParamList } from './types';

const TAB_ICONS: Record<string, string> = { Route: 'route', History: 'history', RepProfile: 'user' };
const TAB_LABELS: Record<string, string> = { Route: 'Marşrut', History: 'Tarixçə', RepProfile: 'Profil' };

function RepTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tint = focused ? FIELD : colors.slate400;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <TouchableOpacity key={route.key} style={styles.item} onPress={onPress} activeOpacity={0.7}>
            <Icon name={TAB_ICONS[route.name]} size={22} color={tint} />
            <Text style={[styles.label, { color: tint, fontWeight: focused ? '700' : '500' }]}>
              {TAB_LABELS[route.name]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const Tab = createBottomTabNavigator<RepTabParamList>();

function RepTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <RepTabBar {...props} />}>
      <Tab.Screen name="Route" component={RouteScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="RepProfile" component={RepProfileScreen} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator<RepStackParamList>();

export function RepNavigator() {
  return (
    <RepToastProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RepTabs" component={RepTabs} />
        <Stack.Screen name="StopDetail" component={StopDetailScreen} />
        <Stack.Screen name="AIConfirm" component={AIConfirmScreen} />
        <Stack.Screen name="RequestCreator" component={RequestCreatorScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </RepToastProvider>
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
  item: { alignItems: 'center', gap: 3, width: 80 },
  label: { fontSize: 10.5 },
});
