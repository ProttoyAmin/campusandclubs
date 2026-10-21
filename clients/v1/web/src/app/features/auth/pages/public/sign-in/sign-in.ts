import { Component, inject } from '@angular/core';
import { SignInForm } from '../../../components/forms/sign-in/sign-in-form';
import { AuthQueries } from '../../../queries/auth.queries';
import { HlmButtonImports } from '@/components/ui/button/src';
import { HlmSeparatorImports } from '@/components/ui/separator/src';
import { HlmSpinnerImports } from '@/components/ui/spinner/src';
import { SocialLogin } from '../../../components/forms/social-login/social-login';
import { Auth, SocialProvider } from '../../../services/auth';

@Component({
  standalone: true,
  imports: [SignInForm, HlmSeparatorImports, HlmSpinnerImports, HlmButtonImports, SocialLogin],
  selector: 'app-sign-in',
  styleUrl: './sign-in.css',
  templateUrl: './sign-in.html',
})
export class SignIn {
  readonly authQueries = inject(AuthQueries);
  readonly auth = inject(Auth)
  socialLoginPending = false;

  readonly googleIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  readonly facebookIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1280px-2023_Facebook_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

    
  onSubmit(data: any) {
    this.authQueries.login.mutate(data);
  }

  handleProviderClick(provider: string): void {
  this.authQueries.socialLogin.mutate(provider as SocialProvider);
}
}
