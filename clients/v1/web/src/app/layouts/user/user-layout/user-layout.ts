import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-user-layout',
  styleUrl: './user-layout.css',
  templateUrl: './user-layout.html',
})
export class UserLayout {
  private route = inject(ActivatedRoute);

  username = this.route.snapshot.paramMap.get('username')

}
