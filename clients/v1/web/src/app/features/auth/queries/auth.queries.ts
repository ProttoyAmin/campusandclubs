import { inject, Injectable } from '@angular/core';
import { Auth } from '../services/auth';
import { injectQuery, injectMutation } from '@tanstack/angular-query-experimental';
import { QueryClientService } from '@/app/config/tanstack';

@Injectable({
  providedIn: 'root',
})
export class AuthQueries {
  private readonly auth = inject(Auth);
  private readonly queryClient = inject(QueryClientService);

  readonly session = injectQuery(() => ({
    queryKey: ['auth', 'session'],
    queryFn: () => this.auth.session(),
  }));

  readonly login = injectMutation(() => ({
    mutationFn: (data: any) => this.auth.login(data),
  }));

  readonly sign_up = injectMutation(() => ({
    mutationFn: (data: any) => this.auth.sign_up(data),
  }));

  readonly logout = injectMutation(() => ({
    mutationFn: () => this.auth.logout(),
    onSuccess: () => {
      this.queryClient.queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  }));
}
