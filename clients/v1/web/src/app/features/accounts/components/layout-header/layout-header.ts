import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { HlmButtonImports } from '@/components/ui/button/src';
import { LucideAngularModule } from 'lucide-angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmAvatarImports } from '@/components/ui/avatar/src';
import { AppDialog } from '@/app/shared/components/ui/app-dialog/app-dialog';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { lucideSettings } from '@ng-icons/lucide';
import { AppNavigator } from '@/app/shared/components/ui/app-navigator/app-navigator';
import { filter } from 'rxjs';
import { UserLayoutContext } from '../../context/layout-context/user-layout-context';

import { AccountQueries } from '@/app/features/accounts/queries/account.queries';

@Component({
  imports: [
    RouterLink,
    HlmButtonImports,
    LucideAngularModule,
    NgIcon,
    HlmAvatarImports,
    AppDialog,
    AppNavigator,
  ],
  providers: [provideIcons({ lucideSettings })],
  standalone: true,
  selector: 'app-accounts-layout-header',
  styleUrl: './layout-header.css',
  templateUrl: './layout-header.html',
})
export class LayoutHeader {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly queries = inject(AccountQueries);
  readonly context = inject(UserLayoutContext);
  // username = this.route.snapshot.paramMap.get('username');
  isDialogOpen = signal<boolean>(false);
  path = signal(this.router.url);
  rootPath = signal(!this.route.firstChild);

  user = this.context.user;
  currentUser = this.queries.me;

  constructor() {
    effect(() => {
      console.log(this.currentUser.data());
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.path.set(event.urlAfterRedirects);
        this.rootPath.set(!this.route.firstChild);
      });
  }

  toggleDialog() {
    this.context.isDialogOpen.update((value) => !value);
    console.log(this.context.isDialogOpen());
  }

  goToSettings() {
    this.router.navigate(['@/settings']);
  }
}
