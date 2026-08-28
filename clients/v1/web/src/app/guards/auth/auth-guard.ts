import { inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@/app/features/auth/services/auth';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);
  const isAuthenticated = signal<boolean>(false);

  auth.session().pipe(
    map((session) => {
      if (session.meta.is_authenticated) {
        isAuthenticated.set(true);
      }
    }),
  );

  if (!isAuthenticated()) {
    return router.createUrlTree(['auth/sign-in']);
  }
  return router.createUrlTree(['']);
};
