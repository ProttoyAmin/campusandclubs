import { MenuItem } from '../types';
import { CircleUserIcon, LockIcon, GitCompareIcon } from 'lucide-angular';

export const userSettingsMenu: MenuItem[] = [
  {
    id: 1,
    label: 'Account',
    icon: CircleUserIcon,
    link: '/@/settings/account',
  },
  {
    id: 2,
    label: 'Privacy',
    icon: LockIcon,
    link: '/@/settings/privacy',
  },
  {
    id: 3,
    label: 'Affiliations',
    icon: GitCompareIcon,
    link: '/@/settings/affiliations',
  },
];
