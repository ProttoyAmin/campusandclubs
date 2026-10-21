import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { HlmButtonImports } from '@/components/ui/button/src';
import { LayoutHeader } from '@/app/features/accounts/components/layout-header/layout-header';
import { AccountQueries } from '@/app/features/accounts/queries/account.queries';
import { UserLayoutContext } from '@/app/features/accounts/context/layout-context/user-layout-context';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  imports: [RouterOutlet, HlmCardImports, HlmButtonImports, LucideAngularModule, LayoutHeader],
  providers: [UserLayoutContext],
  selector: 'app-user-layout',
  styleUrl: './user-layout.css',
  templateUrl: './user-layout.html',
})
export class UserLayout {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly queries = inject(AccountQueries);
  readonly context = inject(UserLayoutContext);
  username = toSignal(this.route.paramMap.pipe(map((params) => params.get('username'))));
  user = this.queries.user(() => this.username());

  constructor() {
    effect(() => {
      this.context.username.set(this.username() ?? null);
      this.context.user.set(this.user.data());
    });
  }

  toggleDialog() {
    this.context.isDialogOpen.update((value) => !value);
  }
  settingsIcon = SettingsIcon;

  goToSettings() {
    this.router.navigate(['@/settings']);
  }
}
