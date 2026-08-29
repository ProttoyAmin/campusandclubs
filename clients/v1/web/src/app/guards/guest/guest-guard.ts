// guest-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@/app/features/auth/services/auth';
import { map } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  return auth.session().pipe(
    map((session) => {
      console.log('SESSION FROM GUEST GUARD: ', session);
      if (session.meta.is_authenticated) {
        return router.createUrlTree(['']);
      }
      return true;
    }),
  );
};
