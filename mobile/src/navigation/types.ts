// Naviqasiya param siyahıları + birləşmiş nav tipi (tab + stack route-larına navigate üçün).
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RepStop } from '../data/repTasks';

export type CitizenTabParamList = {
  Home: undefined;
  MyRequests: undefined;
  Map: undefined;
  Profile: undefined;
};

export type CitizenStackParamList = {
  Tabs: NavigatorScreenParams<CitizenTabParamList> | undefined;
  RequestDetail: { incidentId: string };
  Chat: { incidentId?: string; title?: string };
  RequestCreator: undefined;
};

// Tab ekranlarından həm qonşu tab-a, həm valideyn stack route-una navigate edirik.
export type CitizenNav = NativeStackNavigationProp<
  CitizenStackParamList & CitizenTabParamList
>;

// ---- Nümayəndə (RİH) ----
export type RepTabParamList = {
  Route: undefined;
  History: undefined;
  RepProfile: undefined;
};

export type RepStackParamList = {
  RepTabs: NavigatorScreenParams<RepTabParamList> | undefined;
  StopDetail: { stop: RepStop };
  AIConfirm: { stop: RepStop };
  RequestCreator: { role?: 'citizen' | 'rih' } | undefined;
};

export type RepNav = NativeStackNavigationProp<RepStackParamList & RepTabParamList>;
