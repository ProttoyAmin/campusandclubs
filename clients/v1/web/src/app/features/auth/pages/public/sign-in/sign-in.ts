import { Component, inject } from '@angular/core';
import { SignInForm } from '../../../components/forms/sign-in/sign-in-form';
import { Auth } from '../../../services/auth';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [SignInForm],
  selector: 'app-sign-in',
  styleUrl: './sign-in.css',
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly auth = inject(Auth);
  private router = inject(Router);

  onSubmit(data: any) {
    console.log('submitting from sign in page', data);
    this.auth.login(data).subscribe({
      next: (res) => {
        console.log('Sign in successful', res);
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Sign in failed', err);
      },
    });
  }
}
