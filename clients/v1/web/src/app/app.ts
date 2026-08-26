import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';


@Component({
  imports: [RouterOutlet, RouterLink, HlmButtonImports],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  
})
export class App {
  protected readonly title = signal('web');
}
