import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';


@Component({
  imports: [RouterOutlet, HlmCardImports],
  selector: 'app-auth-layout',
  styleUrl: './auth-layout.css',
  templateUrl: './auth-layout.html',
})
export class AuthLayout {}
