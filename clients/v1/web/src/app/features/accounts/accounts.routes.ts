import { Routes } from '@angular/router';
import { Profile } from './pages/public/profile/profile';
import { USettingsLayout } from '@/app/layouts/user/u-settings-layout/u-settings-layout';
import { UPrivacy } from './pages/private/u-privacy/u-privacy';
import { UAffiliations } from './pages/private/u-affiliations/u-affiliations';
import { USettings } from './pages/private/u-settings/u-settings';

export const userRoutes: Routes = [{ path: '', component: Profile }];

export const userSettingsRoutes: Routes = [
  { path: '', component: USettings },
  { path: 'privacy', component: UPrivacy },
  { path: 'affiliations', component: UAffiliations },
];
