import { HttpInterceptorFn } from '@angular/common/http';
import { Cookie } from '@/app/config/cookies/cookie';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  console.log("platform id: ", platformId);

  // Cookie service reads document.cookie which doesn't exist on the server
  if (!isPlatformBrowser(platformId)) {
    console.log("Is not a browser");
    return next(req);
  }

  console.log("Is a browser");

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
