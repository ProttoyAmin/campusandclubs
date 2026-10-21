import { MenuItem } from './types';
import { SettingsIcon } from 'lucide-angular';

const SideBarDropdownMenu: MenuItem[] = [
  {
    id: 1,
    label: 'Settings',
    icon: SettingsIcon,
    link: '/@/settings',
  },
];

export { SideBarDropdownMenu };
