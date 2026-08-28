import { MenuItem } from '../types';
import { CircleUserIcon, LockIcon, GitCompareIcon } from 'lucide-angular';

export const userSettingsMenu: MenuItem[] = [
  {
    id: 1,
    label: 'Account',
    icon: CircleUserIcon,
    link: 'account',
  },
  {
    id: 2,
    label: 'Privacy',
    icon: LockIcon,
    link: 'privacy',
  },
  {
    id: 3,
    label: 'Affiliations',
    icon: GitCompareIcon,
    link: 'affiliations',
  },
];
