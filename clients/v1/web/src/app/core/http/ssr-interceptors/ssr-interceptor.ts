// ssr-cookie.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { REQUEST } from '@angular/core';

export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    const request = inject(REQUEST, { optional: true });
    const cookie = request?.headers.get('cookie');
    const referer = request?.headers.get('referer');

    const headers: Record<string, string> = {};
    if (cookie) headers['cookie'] = cookie;
    if (referer) headers['referer'] = referer;

    if (Object.keys(headers).length > 0) {
      req = req.clone({ setHeaders: headers });
    }
  }

  return next(req);
};
