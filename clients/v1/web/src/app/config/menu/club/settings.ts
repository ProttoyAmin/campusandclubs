import { MenuItem } from '../types';
import { FileUserIcon, LockIcon, Users } from 'lucide-angular';

export const clubSettingsMenu: MenuItem[] = [
  {
    id: 1,
    label: 'Members',
    icon: Users,
    link: 'members',
  },
  {
    id: 2,
    label: 'Requests',
    icon: FileUserIcon,
    link: 'requests',
  },
];
