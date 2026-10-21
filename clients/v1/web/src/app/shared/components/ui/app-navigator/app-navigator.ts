import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { HlmButton } from '@/components/ui/button/src';
import { LucideAngularModule } from 'lucide-angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideArrowRight } from '@ng-icons/lucide';

@Component({
  imports: [HlmButton, LucideAngularModule, NgIcon],
  standalone: true,
  providers: [provideIcons({ lucideArrowLeft, lucideArrowRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-navigator',
  styleUrl: './app-navigator.css',
  templateUrl: './app-navigator.html',
})
export class AppNavigator {
  disableForward = input<boolean>(false);
  hideForward = input<boolean>(false);

  protected readonly location = inject(Location);
}
