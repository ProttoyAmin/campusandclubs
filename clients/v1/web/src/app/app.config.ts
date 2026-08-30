import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, withInterceptors } from '@angular/common/http';
import { csrfInterceptor } from './core/http/interceptors/csrf-interceptor';
import { ssrCookieInterceptor } from './core/http/ssr-interceptors/ssr-interceptor';
import { CookieService } from 'ngx-cookie-service';

export const appConfig: ApplicationConfig = {
  providers: [
    CookieService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),

    provideHttpClient(withInterceptors([csrfInterceptor, ssrCookieInterceptor])),
  ],
};
