import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
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
  username = this.route.snapshot.paramMap.get('username');
  isDialogOpen = signal<boolean>(false);
  path = signal(this.router.url);
  rootPath = signal(!this.route.firstChild);

  user = input<any>({
    id: '1',
    username: 'prottoy',
    avatar: 'avatar-url',
  });
  currentUser = input<any>({
    id: '1',
    username: 'username',
    avatar: 'avatar-url',
  });

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.path.set(event.urlAfterRedirects);
        this.rootPath.set(!this.route.firstChild);
      });
  }

  toggleDialog() {
    this.isDialogOpen.set(!this.isDialogOpen());
    console.log(this.isDialogOpen());
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
