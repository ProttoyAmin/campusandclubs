import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { UserLayoutContext } from '@/app/features/accounts/context/layout-context/user-layout-context';
import { JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  imports: [JsonPipe],
  // providers: [UserLayoutContext],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  private route = inject(ActivatedRoute);
  private meta = inject(Meta);
  private title = inject(Title);
  readonly context = inject(UserLayoutContext);
  username = toSignal(this.route.paramMap.pipe(map((params) => params.get('username'))));
  profileData = signal<any>(null);
  error = signal<string | null>(null);

  user = this.context.user;

  constructor() {
    effect(() => {
      const userVal = this.user();
      const uname = this.username();
      if (userVal && uname) {
        this.title.setTitle(
          `@${uname} • ${userVal.first_name ? userVal.first_name + ' ' + userVal.last_name : uname} | CQlubs`,
        );
      }
    });
  }

  ngOnInit() {
    this.meta.addTags([
      { name: 'description', content: 'Profile page' },
      { name: 'keywords', content: 'profile, page' },
      { name: 'author', content: 'CQlubs' },
    ]);
  }
}
