import { Component, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { userSettingsMenu } from '@/app/config/menu/user/settings';
import { filter } from 'rxjs';
import { NgClass } from '@angular/common';
import { Menu } from '@/app/shared/components/ui/menu/menu';
import { LayoutHeader } from '@/app/features/accounts/components/layout-header/layout-header';
import { UserLayoutContext } from '@/app/features/accounts/context/layout-context/user-layout-context';
import { AccountQueries } from '@/app/features/accounts/queries/account.queries';

@Component({
  imports: [RouterOutlet, HlmCardImports, NgClass, Menu, LayoutHeader],
  providers: [UserLayoutContext],
  selector: 'app-u-settings-layout',
  styleUrl: './u-settings-layout.css',
  templateUrl: './u-settings-layout.html',
})
export class USettingsLayout {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly queries = inject(AccountQueries);
  readonly context = inject(UserLayoutContext);
  menu = userSettingsMenu;
  me = this.queries.me;

  path = signal(this.router.url);
  rootPath = signal(!this.route.firstChild);

  constructor() {
    effect(() => {
      this.context.user.set(this.me.data());
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.path.set(event.urlAfterRedirects);
        this.rootPath.set(!this.route.firstChild);
      });
  }
}
