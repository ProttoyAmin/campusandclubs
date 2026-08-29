import { MenuItem } from './types';
import { HouseIcon, UserIcon } from 'lucide-angular';

export const mainMenu: MenuItem[] = [
  {
    id: 1,
    label: 'Home',
    icon: HouseIcon,
    link: '/',
  },
  {
    id: 2,
    label: 'Profile',
    icon: UserIcon,
    link: '@/prottoy',
  },
  {
    id: 3,
    label: 'Clubs',
    icon: UserIcon,
    link: 'clubs',
  },
];
