import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LucideAngularModule, SettingsIcon } from "lucide-angular";
import { HlmButtonImports } from '@/components/ui/button/src';
import { LayoutHeader } from '@/app/features/accounts/components/layout-header/layout-header';

@Component({
  imports: [RouterOutlet, HlmCardImports, HlmButtonImports, LucideAngularModule, LayoutHeader],
  selector: 'app-user-layout',
  styleUrl: './user-layout.css',
  templateUrl: './user-layout.html',
})
export class UserLayout {
  private router = inject(Router)
  private route = inject(ActivatedRoute);
  isDialogOpen = signal<boolean>(false);
  
  toggleDialog() {
    this.isDialogOpen.set(!this.isDialogOpen());
    console.log(this.isDialogOpen());
  }
  username = this.route.snapshot.paramMap.get('username')
  settingsIcon = SettingsIcon

  goToSettings() {
    this.router.navigate(['/settings'])
  }

}
