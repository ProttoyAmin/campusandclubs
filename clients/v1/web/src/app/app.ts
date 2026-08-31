import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AccountQueries } from './features/accounts/queries/account.queries';

@Component({
  imports: [RouterOutlet, HlmButtonImports, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('web');
  readonly queries = inject(AccountQueries);

  users = this.queries.all;
  constructor() {
    effect(() => {
      console.log(this.users.data());
    });
  }
}
