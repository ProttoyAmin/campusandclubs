import { Routes } from '@angular/router';
import { RootLayout } from './layouts/root/root-layout/root-layout';
import { AuthLayout } from './layouts/auth/auth-layout/auth-layout';
import { UserLayout } from './layouts/user/user-layout/user-layout';

export const routes: Routes = [
  {
    path: '',
    component: RootLayout,
    children: [
      // {
      //   path: '',
      //   component: App,
      // },
      {
        path: '@/auth',
        component: AuthLayout,
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: '@/:username',
        component: UserLayout,
        loadChildren: () => import('./features/user/user.routes').then((m) => m.userRoutes),
      },
    ],
  },
];
