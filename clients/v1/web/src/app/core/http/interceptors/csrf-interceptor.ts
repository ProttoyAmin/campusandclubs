import { HttpInterceptorFn } from '@angular/common/http';
import { Cookie } from '@/app/config/cookies/cookie';
import { inject } from '@angular/core';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const cookie = inject(Cookie);

  const csrfToken = cookie.get('csrftoken');

  if (!csrfToken) return next(req);
  const csrfReq = req.clone({
    setHeaders: {
      'X-CSRFToken': csrfToken,
    },
  });

  return next(csrfReq);
};
