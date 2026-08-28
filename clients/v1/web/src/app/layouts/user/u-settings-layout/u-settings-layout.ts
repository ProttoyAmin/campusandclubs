import { Component, input, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { userSettingsMenu } from '@/app/config/menu/user/settings';
import { filter } from 'rxjs';
import { NgClass } from '@angular/common';
import { Menu } from '@/app/shared/components/ui/menu/menu';
import { LayoutHeader } from '@/app/features/accounts/components/layout-header/layout-header';

@Component({
  imports: [RouterOutlet, HlmCardImports, NgClass, Menu, LayoutHeader],
  selector: 'app-u-settings-layout',
  styleUrl: './u-settings-layout.css',
  templateUrl: './u-settings-layout.html',
})
export class USettingsLayout {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  menu = userSettingsMenu;

  path = signal(this.router.url);
  rootPath = signal(!this.route.firstChild);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.path.set(event.urlAfterRedirects);
        this.rootPath.set(!this.route.firstChild);
      });
  }
}
