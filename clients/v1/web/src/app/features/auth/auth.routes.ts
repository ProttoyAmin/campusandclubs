import { Routes } from '@angular/router';
import { SignUp } from './pages/public/sign-up/sign-up';
import { SignIn } from './pages/public/sign-in/sign-in';

export const authRoutes: Routes = [
  { path: 'sign-in', component: SignIn },
  { path: 'sign-up', component: SignUp },
];
