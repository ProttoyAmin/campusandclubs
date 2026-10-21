import { Component, inject } from '@angular/core';
import { ApiClient } from '@/app/core/http/api-client';
import { Auth } from '../../../services/auth';
import { HlmButtonImports } from '@/components/ui/button/src';
import { SignUpForm } from '../../../components/forms/sign-up/sign-up-form';
import { SocialLogin } from '../../../components/forms/social-login/social-login';
import { HlmSeparatorImports } from '@/components/ui/separator/src';


@Component({
  standalone: true,
  imports: [HlmButtonImports, SignUpForm, SocialLogin, HlmSeparatorImports],
  selector: 'app-sign-up',
  styleUrl: './sign-up.css',
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly auth = inject(Auth);
  constructor() {}

  socialLoginPending = false;

  readonly googleIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  readonly facebookIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1280px-2023_Facebook_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';


  handleProviderClick(provider: string): void {
    console.log(provider + ' login');
  }

  hit() {
    console.log('sign up hit');
  }
}
