import { inject, Service } from '@angular/core';
import { ApiClient } from '@/app/core/http/api-client';
import { environment } from '@/environments/environment.development';

@Service()
export class Account {
  private readonly api = inject(ApiClient);

  me() {
    return this.api.get(`${environment.apiUrl}/api/accounts/auth/me/`);
  }

  users() {
    return this.api.get(`${environment.apiUrl}/api/accounts/auth/all/`);
  }

  user(username: string) {
    return this.api.get(`${environment.apiUrl}/api/accounts/auth/users/user/${username}/`);
  }

  request_password_reset(email: string) {
    console.log('Requesting password reset...', email);
    return this.api.post(
      `${environment.apiUrl}/api/_allauth/browser/v1/auth/password/request`,
      email,
    );
  }

  password_reset(key: string, password: string) {
    console.log('Resetting password...', key, password);
    return this.api.post(`${environment.apiUrl}/api/_allauth/browser/v1/auth/password/reset`, {
      key,
      password,
    });
  }
}
