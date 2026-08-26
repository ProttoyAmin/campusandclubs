import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  imports: [],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  private route = inject(ActivatedRoute);
  private meta = inject(Meta);
  private title = inject(Title);

  
  username = this.route.snapshot.paramMap.get('username');
  isAuthenticated = signal(true);
  test () {
    console.log(this.isAuthenticated())
  }
}
