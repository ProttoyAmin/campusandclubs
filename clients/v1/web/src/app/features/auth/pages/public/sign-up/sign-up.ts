import { Component, inject } from '@angular/core';
import { ApiClient } from '@/app/core/http/api-client';
import { Auth } from '../../../services/auth';
import { HlmButtonImports } from '@/components/ui/button/src';
import { SignUpForm } from '../../../components/forms/sign-up/sign-up-form';

@Component({
  standalone: true,
  imports: [HlmButtonImports, SignUpForm],
  selector: 'app-sign-up',
  styleUrl: './sign-up.css',
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly auth = inject(Auth);
  constructor() {}

  hit() {
    this.auth
      .sign_up({
        username: 'prottoy',
        password: '123456',
        email: 'prottoy@gmail.com',
      })
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
