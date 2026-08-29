import { Component, EventEmitter, input, Input, output, Output } from '@angular/core';
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
  selector: 'app-sign-in-form',
  styleUrl: './sign-in-form.css',
  templateUrl: './sign-in-form.html',
})
export class SignInForm {
  pending = input<boolean>(false);
  submitForm = input<EventEmitter<any>>(new EventEmitter<any>());
  readonly formSubmit = output<any>();

  signInForm: FormGroup;

  socialLoginPending = false;
  googleIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  facebookIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1280px-2023_Facebook_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.formSubmit.emit(this.signInForm.value);
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.signInForm.get(fieldName);
    if (control && control.errors) {
      const errors = Object.keys(control.errors);
      if (errors.length > 0) {
        // info: customize error messages here
        switch (errors[0]) {
          case 'required':
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
          case 'minlength':
            return 'Password must be at least 8 characters';
          default:
            return `Invalid ${fieldName}`;
        }
      }
    }
    return '';
  }

  navigateToSignUp(): void {
    this.router.navigate(['auth/sign-up']);
  }

  handleFacebookLogin(): void {
    console.log('Facebook login');
  }

  handleGoogleLogin(): void {
    console.log('Google login');
  }
}
