import { ApiClient } from '@/app/core/http/api-client';
import { inject, Service } from '@angular/core';
import { environment } from '@/environments/environment.development';
import { lastValueFrom } from 'rxjs';
import { RegisterRequestWritable, AccountsAuthUsersCreateResponse } from '@campus/api';

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

@Service()
export class Auth {
  private api = inject(ApiClient);

  session() {
    console.log('Getting session...');
    return lastValueFrom(
      this.api.get<AuthSession>(`${environment.apiUrl}/api/_allauth/browser/v1/auth/session`),
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
}
