import { Menu } from '../menu/menu';
import { MenuItem } from '@/app/config/menu/types';
import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { LucideAngularModule, EllipsisIcon } from 'lucide-angular';
import { HlmButton } from '@/components/ui/button/src';
import { AppAlertDialog } from '../app-alert-dialog/app-alert-dialog';
import { AppDropdownMenu } from '../dropdown-menu/dropdown-menu';
import { Auth } from '@/app/features/auth/services/auth';
import { catchError, of, tap } from 'rxjs';
import { SideBarDropdownMenu } from '@/app/config/menu';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    HlmButton,
    Menu,
    AppAlertDialog,
    AppDropdownMenu,
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private auth = inject(Auth);
  private router = inject(Router);
  items = input.required<MenuItem[]>();

  root = input<boolean>(false);
  ellipsis = EllipsisIcon;
  alertOpen = signal<boolean>(false);

  sidebarDropdown = SideBarDropdownMenu;

  onSidebarMenuClick(item: MenuItem) {
    console.log('Sidebar menu item clicked:', item);
  }

  onLogoutClick() {
    this.auth
      .logout()
      .pipe(
        tap(() => console.log('Session deleted on server')),
        catchError((err) => {
          console.error('Logout request failed', err);
          return of(null); // swallow error so subscribe still completes
        }),
      )
      .subscribe(() => {
        // navigate away, clear tokens, etc.
        this.router.navigate(['auth/sign-in']);
      });
  }

  handleCancel(): void {
    console.log('User cancelled');
  }

  handleLogout(): void {
    console.log('Logged out');
    this.alertOpen.set(false);
  }
}
