import { LucideIconData } from 'lucide-angular';

export interface MenuItem {
  id: string | number;
  label: string;
  icon: LucideIconData;
  link: string;
}
