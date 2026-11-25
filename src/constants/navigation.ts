import type { Icon } from '@phosphor-icons/react';
import {
  AppleLogo,
  ChartLineUp,
  House,
  UserCircle,
} from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  Icon: Icon;
  to: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Início', Icon: House, to: '/' },
  { id: 'diet', label: 'Dieta', Icon: AppleLogo, to: '/foods' },
  { id: 'metrics', label: 'Métricas', Icon: ChartLineUp, to: '/stats' },
  { id: 'profile', label: 'Perfil', Icon: UserCircle, to: '/profile' },
] as const;
