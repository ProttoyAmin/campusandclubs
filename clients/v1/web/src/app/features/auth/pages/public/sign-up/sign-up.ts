import { Component, inject } from '@angular/core';
import { ApiClient } from '@/app/core/http/api-client';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-sign-up',
  styleUrl: './sign-up.css',
  templateUrl: './sign-up.html',
})
export class SignUp {
  api = inject(ApiClient)
  constructor() {}


  hit() {
  this.api.get('http://localhost:8000/api/_allauth/browser/v1/auth/session').subscribe({
    next: (res) => {
      console.log(res);
    },
    error: (err) => {
      console.error(err);
    },
  });
}

}
