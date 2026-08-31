import { Routes } from '@angular/router';
import { RootLayout } from './layouts/root/root-layout/root-layout';
import { AuthLayout } from './layouts/auth/auth-layout/auth-layout';
import { UserLayout } from './layouts/user/user-layout/user-layout';
import { USettingsLayout } from './layouts/user/u-settings-layout/u-settings-layout';
import { ClubLayout } from './layouts/club/club-layout/club-layout';
import { authGuard } from './guards/auth/auth-guard';
import { guestGuard } from './guards/guest/guest-guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '@',
        children: [
          // /@/auth/*
          {
            path: 'auth',
            component: AuthLayout,
            canActivate: [guestGuard],
            title: 'CQlubs',
            loadChildren: () =>
              import('./features/auth/auth.routes')
                .then(m => m.authRoutes),
          },

          {
            path: '',
            component: RootLayout,
            canActivate: [authGuard],
            children: [
              // /@/clubs/*
          {
            path: 'clubs',
            loadChildren: () =>
              import('./features/clubs/clubs.routes')
                .then(m => m.clubRoutes),
          },

          // /@/u/:username/settings/*
          {
            path: 'settings',
            component: USettingsLayout,
            loadChildren: () =>
              import('./features/accounts/accounts.routes')
                .then(m => m.userSettingsRoutes),
          },

          // /@/:username/*
          {
            path: ':username',
            component: UserLayout,
            loadChildren: () =>
              import('./features/accounts/accounts.routes')
                .then(m => m.userRoutes),
          },
            ]
          }
        ],
      },
    ],
  },
];
