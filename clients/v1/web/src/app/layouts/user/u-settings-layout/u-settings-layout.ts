import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  imports: [RouterOutlet, HlmCardImports],
  selector: 'app-u-settings-layout',
  styleUrl: './u-settings-layout.css',
  templateUrl: './u-settings-layout.html',
})
export class USettingsLayout {}
