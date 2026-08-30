import { ApiClient } from '@/app/core/http/api-client';
import { inject, Service } from '@angular/core';
import { environment } from '@/environments/environment.development';

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
    return this.api.get<AuthSession>(`${environment.apiUrl}/api/_allauth/browser/v1/auth/session`);
  }

  logout() {
    console.log('Signing out...');
    return this.api.delete(`${environment.apiUrl}/api/_allauth/browser/v1/auth/session`);
  }

  login(data: any) {
    console.log('Signing in...', data);
    return this.api.post(`${environment.apiUrl}/api/_allauth/browser/v1/auth/login`, data);
  }

  sign_up(data: any) {
    console.log('Signing up...', data);
    return this.api.post(`${environment.apiUrl}/api/_allauth/browser/v1/auth/signup`, data);
  }
}
