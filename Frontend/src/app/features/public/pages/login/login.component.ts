import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, RouterLink],
  template: `
    <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 selection:bg-pink-500 selection:text-white">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ 'LOGIN_PAGE.TITLE' | translate }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ 'LOGIN_PAGE.SUBTITLE' | translate }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" (ngSubmit)="login()">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">{{ 'LOGIN_PAGE.EMAIL' | translate }}</label>
              <div class="mt-1">
                <input [(ngModel)]="email" name="email" id="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">{{ 'LOGIN_PAGE.PASSWORD' | translate }}</label>
              <div class="mt-1">
                <input [(ngModel)]="password" name="password" id="password" type="password" autocomplete="current-password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
              </div>
            </div>

            <div class="flex items-center justify-between mb-2">
              <a routerLink="/forgot-password" class="text-sm font-medium text-pink-600 hover:text-pink-500">
                {{ 'LOGIN_PAGE.FORGOT_PASSWORD' | translate }}
              </a>
            </div>

            <div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">
                {{ 'LOGIN_PAGE.BUTTON' | translate }}
              </button>
            </div>

            <!-- Google Sign In -->
            <div class="mt-6">
                <!-- Real Google Button Container -->
                 <div id="google-btn-login" class="w-full flex justify-center"></div>

                <!-- Fallback/Mock Button -->
                <button *ngIf="false && !environment.production" type="button" (click)="signInWithGoogle()" class="mt-2 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">
                    <span class="mr-2 text-xs text-gray-400">(Mock)</span>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5 mr-2">
                    Sign in with Google
                </button>
            </div>

            <div class="mt-6">
                <div class="relative">
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">
                            {{ 'LOGIN_PAGE.NO_ACCOUNT' | translate }} <a routerLink="/auth/register" class="font-bold text-pink-600 hover:text-pink-500">{{ 'LOGIN_PAGE.REGISTER_LINK' | translate }}</a>
                        </span>
                    </div>
                </div>
            </div>
            
            <div *ngIf="errorMessage" class="text-red-600 text-sm text-center">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  environment = environment;
  returnUrl: string = '/';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => {
        this.errorMessage = err.error.message || 'Login failed';
      }
    });
  }

  ngAfterViewInit() {
    this.renderGoogleButton();
  }

  renderGoogleButton() {
    // @ts-ignore
    if (typeof google !== 'undefined' && environment.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
      const btnEl = document.getElementById("google-btn-login");
      if (btnEl) {
        // @ts-ignore
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.handleGoogleCredential(response)
        });
        // @ts-ignore
        google.accounts.id.renderButton(
          btnEl,
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    } else {
      setTimeout(() => this.renderGoogleButton(), 500);
    }
  }

  handleGoogleCredential(response: any) {
    if (response.credential) {
      const payload = this.decodeToken(response.credential);
      const googleUser = {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        photoUrl: payload.picture,
        token: response.credential
      };

      this.auth.googleLogin(googleUser).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => {
          this.errorMessage = 'Google Login failed: ' + err.message;
        }
      });
    }
  }

  decodeToken(token: string) {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  // Fallback / Mock
  signInWithGoogle() {
    if (environment.googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
      alert('Please configure googleClientId in environment.ts to use real Google Auth. Using Mock for now.');
      // In a real app, this would trigger the Google Popup
      const mockGoogleUser = {
        email: `google_user_${Date.now()}@gmail.com`,
        name: 'Google User',
        googleId: `gid_${Date.now()}`,
        photoUrl: 'https://lh3.googleusercontent.com/a-/AOh14Hg...'
      };

      this.auth.googleLogin(mockGoogleUser).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => {
          this.errorMessage = 'Google Login failed';
        }
      });
      return;
    }
  }

  private handleSuccess(res: any) {
    if (this.returnUrl && this.returnUrl !== '/') {
      this.router.navigateByUrl(this.returnUrl);
    } else if (res.user.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
