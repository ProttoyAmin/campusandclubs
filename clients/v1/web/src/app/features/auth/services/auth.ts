import { ApiClient } from '@/app/core/http/api-client';
import { inject, Service, signal } from '@angular/core';
import { environment } from '@/environments/environment.development';
import { catchError, lastValueFrom, of, tap, throwError } from 'rxjs';
import { RegisterRequestWritable, AccountsAuthUsersCreateResponse } from '@campus/api';
import { Cookie } from '@/app/config/cookies/cookie';
import { HttpErrorResponse } from '@angular/common/http';

export type AuthSession = {
  status: number;
  data: {
    user: any | null;
    methods: string[];
  };
  meta: {
    is_authenticated: boolean;
  };
};


export type SocialProvider = "google" | "facebook" | "github";

@Service()
export class Auth {
  private api = inject(ApiClient);
  private cookie = inject(Cookie);
  readonly authenticated = signal<boolean>(false);

  async session() {
    return await lastValueFrom(
    this.api
      .get<AuthSession>(
        `${environment.apiUrl}/api/_allauth/browser/v1/auth/session`,
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          // allauth returns 401/410 for "not authenticated" states,
          // but the body is still a valid AuthSession — not a real error
          if (err.status === 401 || err.status === 410) {
            return of(err.error as AuthSession);
          }
          return throwError(() => err);
        }),
        tap((response) => {
          console.log('Auth Session:', response);
          this.authenticated.set(response.meta.is_authenticated);
          console.log(this.authenticated());
        })
      )
  );
}

  logout() {
    console.log('Signing out...');
    return lastValueFrom(
      this.api.delete(`${environment.apiUrl}/api/_allauth/browser/v1/auth/session`),
    );
  }

  login(data: any) {
    console.log('Signing in...', data);
    return lastValueFrom(
      this.api.post(`${environment.apiUrl}/api/_allauth/browser/v1/auth/login`, data),
    );
  }

  sign_up(data: RegisterRequestWritable) {
    console.log('Signing up...', data);
    return lastValueFrom(
      this.api.post<AccountsAuthUsersCreateResponse>(
        `${environment.apiUrl}/api/_allauth/browser/v1/auth/signup`,
        data,
      ),
    );
  }

  social_login(provider: SocialProvider) {
    const csrfToken = this.cookie.get('csrftoken');
    const socialForm = document.getElementById(`socialForm-${provider}`) as HTMLFormElement;
    const process = socialForm['process'].value
    const callback_url = socialForm['callback_url'].value
    if (!csrfToken || !process || !callback_url) {
      console.error('Missing data');
      return Promise.reject();
    }

    const csrfInput = socialForm.querySelector(
      'input[name="csrfmiddlewaretoken"]'
    ) as HTMLInputElement;
    csrfInput.value = csrfToken;

    socialForm.requestSubmit()
    return Promise.resolve();
  }
}
