import { Routes } from '@angular/router';
import { Profile } from './features/user/pages/public/profile/profile';
import { RootLayout } from './layouts/root/root-layout/root-layout';
import { AuthLayout } from './layouts/auth/auth-layout/auth-layout';
import { UserLayout } from './layouts/user/user-layout/user-layout';

export const routes: Routes = [
  {
    path: '',
    component: RootLayout,
    children: [
      {
        path: '@/auth',
        component: AuthLayout,
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: '@/:username',
        component: UserLayout,
        children: [{ path: '', component: Profile }],
      },
    ],
  },
];
