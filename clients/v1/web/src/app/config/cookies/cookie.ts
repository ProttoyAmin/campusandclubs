import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Cookie {
  private readonly cookieService = inject(CookieService);

  get(name: string) {
    return this.cookieService.get(name);
  }

  set(name: string, value: string) {
    this.cookieService.set(name, value);
  }

  delete(name: string) {
    this.cookieService.delete(name);
  }
}
