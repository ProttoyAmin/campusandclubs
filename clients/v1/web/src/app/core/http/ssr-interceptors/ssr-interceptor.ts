// ssr-cookie.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { REQUEST } from '@angular/core'; // or '@angular/ssr' depending on your Angular version

export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    const request = inject(REQUEST, { optional: true });
    const cookie = request?.headers.get('cookie');

    if (cookie) {
      req = req.clone({
        setHeaders: { cookie },
      });
    }
  }

  return next(req);
};
