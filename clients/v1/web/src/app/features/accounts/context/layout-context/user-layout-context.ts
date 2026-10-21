import { Injectable, signal } from '@angular/core';

@Injectable()
export class UserLayoutContext {
  username = signal<string | null>(null);
  isDialogOpen = signal(false);

  user = signal<any>(null);

  toggleDialog() {
    this.isDialogOpen.update((value) => !value);
  }
}
