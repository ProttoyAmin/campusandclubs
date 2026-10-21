import { Routes } from '@angular/router';
import { SignUp } from './pages/public/sign-up/sign-up';
import { SignIn } from './pages/public/sign-in/sign-in';
import { SocialCallback } from './pages/public/social-callback/social-callback';
import { ResetPassword } from './pages/private/reset-password/reset-password';
export const authRoutes: Routes = [
  { path: 'sign-in', component: SignIn, title: 'CQlubs • Sign in' },
  { path: 'sign-up', component: SignUp, title: 'CQlubs • Sign up' },
  { path: 'account/reset-password/:key', component: ResetPassword, title: 'CQlubs • Reset Password' },
  { path: 'callback', component: SocialCallback, title: 'CQlubs • Callback' },
];
