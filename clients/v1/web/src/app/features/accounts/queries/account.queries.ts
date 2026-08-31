import { inject, Injectable, signal } from '@angular/core';
import { injectQuery, injectMutation } from '@tanstack/angular-query-experimental';
import { QueryClientService } from '@/app/config/tanstack';
import { Account } from '../services/account';
import { Auth } from '../../auth/services/auth';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountQueries {
  private readonly account = inject(Account);
  private readonly auth = inject(Auth);
  private readonly queryClient = inject(QueryClientService);
  readonly username = signal<string | null>(null);

  readonly me = injectQuery(() => ({
    queryKey: ['account', 'me'],
    queryFn: () => lastValueFrom(this.account.me()),
    enabled: !!this.auth.authenticated(),
  }));

  user(username: string | (() => string | null)) {
    return injectQuery(() => {
      const u = typeof username === 'function' ? username() : username;
      return {
        queryKey: ['account', u ?? ''],
        queryFn: () => lastValueFrom(this.account.user(u ?? '')),
        enabled: !!u,
      };
    });
  }

  all = injectQuery(() => ({
    queryKey: ['account', 'all'],
    queryFn: () => lastValueFrom(this.account.users()),
  }));
}
