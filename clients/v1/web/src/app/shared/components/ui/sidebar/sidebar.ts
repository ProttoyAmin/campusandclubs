import { Menu } from '../menu/menu';
import { MenuItem } from '@/app/config/menu/types';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { LucideAngularModule, EllipsisIcon } from "lucide-angular";
import { HlmButton } from '@/components/ui/button/src';

@Component({
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, HlmButton, Menu],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  items = input.required<MenuItem[]>();
  root = input<boolean>(false);
  ellipsis = EllipsisIcon;
}
