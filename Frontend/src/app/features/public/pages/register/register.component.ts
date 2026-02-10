import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, RouterLink],
  template: `
    <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 selection:bg-pink-500 selection:text-white">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ 'REGISTER_PAGE.TITLE' | translate }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ 'REGISTER_PAGE.SUBTITLE' | translate }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <!-- Register Form -->
            <div *ngIf="step === 'register'">
                <form class="space-y-6" (ngSubmit)="register()">
                    <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">{{ 'REGISTER_PAGE.NAME' | translate }}</label>
                    <div class="mt-1">
                        <input [(ngModel)]="name" name="name" id="name" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                    </div>
                    </div>

                    <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">{{ 'REGISTER_PAGE.EMAIL' | translate }}</label>
                    <div class="mt-1">
                        <input [(ngModel)]="email" name="email" id="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                    </div>
                    </div>

                    <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number (Optional - for 2FA)</label>
                    <div class="mt-1">
                        <input [(ngModel)]="phoneNumber" name="phone" id="phone" type="tel" class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                    </div>
                    </div>

                    <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">{{ 'REGISTER_PAGE.PASSWORD' | translate }}</label>
                    <div class="mt-1">
                        <input [(ngModel)]="password" name="password" id="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                    </div>
                    </div>

                    <div>
                    <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">
                        {{ 'REGISTER_PAGE.BUTTON' | translate }}
                    </button>
                    </div>

                    <!-- Google Sign In -->
                    <div class="mt-6">
                        <div id="google-btn" class="w-full flex justify-center"></div>
                        <!-- Fallback/Mock Button if Real Load Fails or is mocked -->
                        <button *ngIf="false && !environment.production" type="button" (click)="signInWithGoogle()" class="mt-2 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">
                            <span class="mr-2 text-xs text-gray-400">(Mock)</span>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5 mr-2">
                            Sign up with Google
                        </button>
                    </div>
                </form>
            </div>

            <!-- Verify Form -->
            <div *ngIf="step === 'verify'">
                <div class="text-center mb-6">
                    <h3 class="text-lg font-medium text-gray-900">Verify your phone</h3>
                    <p class="text-sm text-gray-500">We sent a code to {{ phoneNumber }}</p>
                    <p class="text-xs text-gray-400">(Check backend console for Mock Code)</p>
                </div>
                <form class="space-y-6" (ngSubmit)="verifyCode()">
                    <div>
                    <label for="code" class="block text-sm font-medium text-gray-700">Verification Code</label>
                    <div class="mt-1">
                        <input [(ngModel)]="verificationCode" name="code" id="code" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-center tracking-widest text-xl">
                    </div>
                    </div>

                    <div>
                    <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors">
                        Verify Code
                    </button>
                    </div>
                </form>
            </div>
            
            <div class="mt-6">
                <div class="relative">
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">
                            {{ 'REGISTER_PAGE.ALREADY_ACCOUNT' | translate }} <a routerLink="/auth/login" class="font-bold text-pink-600 hover:text-pink-500">{{ 'REGISTER_PAGE.LOGIN_LINK' | translate }}</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  phoneNumber = '';
  environment = environment; // Expose to template

  step: 'register' | 'verify' = 'register';
  tempUserId: number | null = null;
  verificationCode = '';

  constructor(private auth: AuthService, private router: Router) { }

  register() {
    this.auth.register({
      name: this.name,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber
    }).subscribe({
      next: (res) => {
        if (res.requires2FA) {
          this.step = 'verify';
          this.tempUserId = res.userId;
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => alert('Registration failed: ' + (err.error?.message || err.message))
    });
  }

  verifyCode() {
    if (!this.tempUserId) return;
    this.auth.verifySms(this.tempUserId, this.verificationCode).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => alert('Verification failed: ' + (err.error?.message || err.message))
    });
  }

  ngOnInit() {
    // Initialize Google Sign In
    // @ts-ignore
    if (typeof google !== 'undefined' && environment.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response)
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
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
        next: () => this.router.navigate(['/']),
        error: (err) => alert('Google Login failed: ' + err.message)
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
      // Here we simulate getting a token/profile from Google
      const mockGoogleUser = {
        email: `google_user_${Date.now()}@gmail.com`,
        name: 'Google User',
        googleId: `gid_${Date.now()}`,
        photoUrl: 'https://lh3.googleusercontent.com/a-/AOh14Hg...'
      };

      this.auth.googleLogin(mockGoogleUser).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => alert('Google Login failed')
      });
      return;
    }
  }
}
