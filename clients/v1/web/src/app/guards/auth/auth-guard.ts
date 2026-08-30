import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthQueries } from '@/app/features/auth/queries/auth.queries';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthQueries);

  return toObservable(auth.session.status).pipe(
    filter((status) => status !== 'pending'), // wait until success or error
    take(1),
    map(() => {
      const isAuthenticated = !!auth.session.data();
      return isAuthenticated ? true : router.createUrlTree(['/auth/sign-in']);
    }),
  );
};
