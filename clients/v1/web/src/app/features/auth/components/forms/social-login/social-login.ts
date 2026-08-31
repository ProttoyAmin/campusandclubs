import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmButtonImports } from '@/components/ui/button/src';
import { HlmSeparatorImports } from '@/components/ui/separator/src';
import { HlmSpinnerImports } from '@/components/ui/spinner/src';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-social-login',
  imports: [HlmButtonImports, HlmSeparatorImports, HlmSpinnerImports, TitleCasePipe],
  templateUrl: './social-login.html',
  styleUrl: './social-login.css',
})
export class SocialLogin {
  @Input() providers: string[] = ['google', 'facebook'];
  @Input() socialLoginPending: boolean = false;

  @Output() providerClicked = new EventEmitter<string>();

  readonly googleIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  readonly facebookIconLogo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1280px-2023_Facebook_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

  readonly githubIconLogo =
    "https://cdn-icons-png.flaticon.com/512/25/25231.png"

  callbackUrl = 'http://localhost:3000/@/auth/callback';

  onProviderClick(provider: string) {
    this.providerClicked.emit(provider);
  }
}
