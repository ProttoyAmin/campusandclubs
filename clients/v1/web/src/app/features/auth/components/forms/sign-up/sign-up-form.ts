import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Import your UI components (adjust imports based on your design system)
import { HlmCardImports } from '@/components/ui/card/src';
import { HlmInputImports } from '@/components/ui/input/src';

import { HlmButtonImports } from '@/components/ui/button/src';
import { HlmFieldImports } from '@/components/ui/field/src';
import { HlmSpinnerImports } from '@/components/ui/spinner/src';
import { HlmSeparatorImports } from '@/components/ui/separator/src';
import { Auth } from '../../../services/auth';

// Import your services and types

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HlmCardImports,
    HlmInputImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmSpinnerImports,
    HlmSeparatorImports,
  ],
  selector: 'app-sign-up-form',
  styleUrl: './sign-up-form.css',
  templateUrl: './sign-up-form.html',
})
export class SignUpForm {
  pending = input<boolean>(false);
  submitForm = new EventEmitter<any>();

  signUpForm: FormGroup;

  socialLoginPending = false;
  googleIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  facebookIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1280px-2023_Facebook_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth,
  ) {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      re_password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    console.log('Submitting form...', this.signUpForm.value);
    if (this.signUpForm.valid) {
      this.submitForm.emit(this.signUpForm.value);
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.signUpForm.get(fieldName);
    if (control && control.errors) {
      const errors = Object.keys(control.errors);
      if (errors.length > 0) {
        // info: You can customize error messages here
        switch (errors[0]) {
          case 'required':
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
          case 'email':
            return 'Please enter a valid email address';
          case 'minlength':
            return 'Password must be at least 8 characters';
          default:
            return `Invalid ${fieldName}`;
        }
      }
    }
    return '';
  }

  navigateToSignIn(): void {
    this.router.navigate(['auth/sign-in']);
  }

  handleFacebookLogin(): void {
    console.log('Facebook login');
  }

  handleGoogleLogin(): void {
    console.log('Google login');
  }
}
