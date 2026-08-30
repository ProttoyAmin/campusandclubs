import { Component, input } from '@angular/core';
import { MenuItem } from '@/app/config/menu/types';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ArrowRightIcon, ChevronRightIcon } from "lucide-angular";
import { HlmButton } from '@/components/ui/button/src';
import { provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucideArrowBigRightDash } from '@ng-icons/lucide';


@Component({
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  providers: [provideIcons({ lucideEllipsis, lucideArrowBigRightDash })],
  selector: 'app-menu',
  styleUrl: './menu.css',
  templateUrl: './menu.html',
})
export class Menu {
  items = input<MenuItem[]>();
  horizontal = input<boolean>(false);
  className = input<string>();
  itemClassName = input<string>();
  visibleArrow = input<boolean>(false);

  chevronRight = ChevronRightIcon;

}
