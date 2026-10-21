import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LucideAngularModule, SettingsIcon } from 'lucide-angular';
import { HlmButtonImports } from '@/components/ui/button/src';
import { LayoutHeader } from '@/app/features/clubs/components/layout-header/layout-header';

@Component({
  imports: [RouterOutlet, HlmCardImports, LucideAngularModule, HlmButtonImports, LayoutHeader],
  selector: 'app-club-layout',
  styleUrl: './club-layout.css',
  templateUrl: './club-layout.html',
})
export class ClubLayout {}
