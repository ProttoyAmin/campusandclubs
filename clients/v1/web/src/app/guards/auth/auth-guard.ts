import { inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@/app/features/auth/services/auth';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  return auth.session().pipe(
    map((session) => {
      console.log('SESSION FROM AUTH GUARD: ', session);
      if (session.meta.is_authenticated) {
        return true;
      }
      return router.createUrlTree(['auth/sign-in']);
    }),
  );
};
