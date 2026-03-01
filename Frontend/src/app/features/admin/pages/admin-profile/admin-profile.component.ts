
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ 'ADMIN.PROFILE.TITLE' | translate }}</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Profile Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">{{ 'ADMIN.PROFILE.TAB_INFO' | translate }}</h2>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              </div>
              <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" formControlName="phoneNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" [disabled]="profileForm.invalid || loadingProfile" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ loadingProfile ? 'Saving...' : ('ADMIN.PROFILE.SAVE' | translate) }}
              </button>
              <p *ngIf="profileMessage" class="mt-2 text-sm" [class.text-green-600]="profileSuccess" [class.text-red-600]="!profileSuccess">{{ profileMessage }}</p>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">{{ 'ADMIN.PROFILE.TAB_SECURITY' | translate }}</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" formControlName="currentPassword" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" formControlName="newPassword" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" formControlName="confirmPassword" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              </div>
            </div>
            <div class="mt-4">
              <button type="submit" [disabled]="passwordForm.invalid || loadingPassword" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ loadingPassword ? 'Updating...' : 'Update Password' }}
              </button>
               <p *ngIf="passwordMessage" class="mt-2 text-sm" [class.text-green-600]="passwordSuccess" [class.text-red-600]="!passwordSuccess">{{ passwordMessage }}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;

  loadingProfile = false;
  profileMessage = '';
  profileSuccess = false;

  loadingPassword = false;
  passwordMessage = '';
  passwordSuccess = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber
        });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.loadingProfile = true;
    this.profileMessage = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.loadingProfile = false;
        this.profileSuccess = true;
        this.profileMessage = 'Profile updated successfully';
        setTimeout(() => this.profileMessage = '', 3000);
      },
      error: (err) => {
        this.loadingProfile = false;
        this.profileSuccess = false;
        this.profileMessage = err.error?.message || 'Error updating profile';
      }
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;

    this.loadingPassword = true;
    this.passwordMessage = '';

    this.authService.updatePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.loadingPassword = false;
        this.passwordSuccess = true;
        this.passwordMessage = 'Password updated successfully';
        this.passwordForm.reset();
        setTimeout(() => this.passwordMessage = '', 3000);
      },
      error: (err) => {
        this.loadingPassword = false;
        this.passwordSuccess = false;
        this.passwordMessage = err.error?.message || 'Error updating password';
      }
    });
  }
}
