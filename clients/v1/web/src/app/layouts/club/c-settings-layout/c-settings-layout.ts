import { Component, input, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { filter } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AppNavigator } from '@/app/shared/components/ui/app-navigator/app-navigator';
import { NgClass } from '@angular/common';
import { Menu } from '@/app/shared/components/ui/menu/menu';
import { LayoutHeader } from '@/app/features/accounts/components/layout-header/layout-header';
import { clubSettingsMenu } from '@/app/config/menu/club/settings';

@Component({
  imports: [RouterOutlet, HlmCardImports, RouterLink, AppNavigator, NgClass, Menu, LayoutHeader],
  selector: 'app-c-settings-layout',
  styleUrl: './c-settings-layout.css',
  templateUrl: './c-settings-layout.html',
})
export class CSettingsLayout {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  menu = clubSettingsMenu;

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
