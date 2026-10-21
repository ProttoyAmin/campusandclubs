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
import { AuthQueries } from '@/app/features/auth/queries/auth.queries';

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
  private queries = inject(AuthQueries);
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
    this.queries.logout.mutate(undefined, {
      onSuccess: () => {
        this.router.navigate(['auth/sign-in']);
      },
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
