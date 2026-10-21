import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmDropdownMenuImports } from '@/components/ui/dropdown-menu/src';
import { HlmButtonImports } from '@/components/ui/button/src';
import { LucideAngularModule, LogOutIcon } from 'lucide-angular';
import { MenuItem } from '@/app/config/menu/types';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [HlmDropdownMenuImports, HlmButtonImports, LucideAngularModule, RouterLink],
  templateUrl: './dropdown-menu.html',
})
export class AppDropdownMenu {
  @Input() items: MenuItem[] = [];
  @Input() triggerLabel: string = 'Open';
  @Input() align: 'start' | 'end' = 'start';
  @Input() variant: 'outline' | 'ghost' | 'default' = 'outline';
  @Input() size: 'default' | 'icon' | 'sm' = 'default';
  @Input() showLogout: boolean = false;

  @Output() logout = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<MenuItem>();

  logoutIcon = LogOutIcon;

  handleItemClick(item: MenuItem) {
    this.itemClick.emit(item);
  }
}
