import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { Sidebar } from '../../../shared/components/ui/sidebar/sidebar';

@Component({
  imports: [RouterOutlet, HlmCardImports, Sidebar],
  selector: 'app-root-layout',
  styleUrl: './root-layout.css',
  templateUrl: './root-layout.html',
})
export class RootLayout {}
