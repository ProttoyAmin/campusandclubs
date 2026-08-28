import { Routes } from '@angular/router';
import { Clubs } from './pages/public/clubs/clubs';
import { ClubPage } from './pages/public/club-page/club-page';
import { ClubLayout } from '@/app/layouts/club/club-layout/club-layout';
import { CSettingsLayout } from '@/app/layouts/club/c-settings-layout/c-settings-layout';
import { CSMain } from './pages/private/c-settings/c-s-main/c-s-main';
import { CMMain } from './pages/private/c-members/c-m-main/c-m-main';
import { CRMain } from './pages/private/c-requests/c-r-main/c-r-main';

export const clubRoutes: Routes = [
  { path: '', component: Clubs },
  {
    path: ':club_slug',
    component: ClubLayout,
    children: [
      { path: '', component: ClubPage },
      {
        path: 'configure',
        component: CSettingsLayout,
        children: [
          { path: '', component: CSMain },
          { path: 'members', component: CMMain },
          { path: 'requests', component: CRMain },
        ],
      },
    ],
  },
];
