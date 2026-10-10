import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

export type TabIconName = ComponentProps<typeof SymbolView>['name'];

export const TAB_ITEMS = [
  {
    route: 'index',
    trigger: 'home',
    href: '/',
    label: 'Home',
    icon: { ios: 'house.fill', android: 'home', web: 'home' },
  },
  {
    route: 'chatbot',
    trigger: 'chatbot',
    href: '/chatbot',
    label: 'Chat',
    icon: { ios: 'message.fill', android: 'chat', web: 'chat' },
  },
  {
    route: 'health-centers',
    trigger: 'centers',
    href: '/health-centers',
    label: 'Centers',
    icon: { ios: 'cross.case.fill', android: 'local_hospital', web: 'local_hospital' },
  },
  {
    route: 'doctors',
    trigger: 'doctors',
    href: '/doctors',
    label: 'Doctors',
    icon: { ios: 'stethoscope', android: 'medical_services', web: 'medical_services' },
  },
  {
    route: 'profile',
    trigger: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: { ios: 'person.fill', android: 'person', web: 'person' },
  },
] as const;

export function TabIcon({
  name,
  tintColor,
  size = 22,
}: {
  name: TabIconName;
  tintColor: string;
  size?: number;
}) {
  return <SymbolView name={name} size={size} weight="semibold" tintColor={tintColor} />;
}
