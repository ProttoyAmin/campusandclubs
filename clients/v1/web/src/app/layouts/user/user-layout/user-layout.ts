import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LucideAngularModule, SettingsIcon } from "lucide-angular";
import { HlmButtonImports } from '@/components/ui/button/src';

@Component({
  imports: [RouterOutlet, HlmCardImports, HlmButtonImports, LucideAngularModule],
  selector: 'app-user-layout',
  styleUrl: './user-layout.css',
  templateUrl: './user-layout.html',
})
export class UserLayout {
  private router = inject(Router)
  private route = inject(ActivatedRoute);

  username = this.route.snapshot.paramMap.get('username')
  settingsIcon = SettingsIcon

  goToSettings() {
    this.router.navigate(['/settings'])
  }

}
