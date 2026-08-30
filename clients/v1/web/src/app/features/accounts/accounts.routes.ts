import { Routes } from '@angular/router';
import { Profile } from './pages/public/profile/profile';
import { Account } from './pages/private/account/account';
import { UPrivacy } from './pages/private/u-privacy/u-privacy';
import { UAffiliations } from './pages/private/u-affiliations/u-affiliations';
import { USettings } from './pages/private/u-settings/u-settings';

export const userRoutes: Routes = [{ path: '', component: Profile }];

export const userSettingsRoutes: Routes = [
  { path: 'account', component: Account },
  { path: 'privacy', component: UPrivacy },
  { path: 'affiliations', component: UAffiliations },
];
