import { Component, inject } from '@angular/core';
import { SignInForm } from '../../../components/forms/sign-in/sign-in-form';
import { Auth } from '../../../services/auth';

@Component({
  standalone: true,
  imports: [SignInForm],
  selector: 'app-sign-in',
  styleUrl: './sign-in.css',
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly auth = inject(Auth);

  onSubmit(data: any) {
    console.log('submitting from sign in page', data);
  }
}
