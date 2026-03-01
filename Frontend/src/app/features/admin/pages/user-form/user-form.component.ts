
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tight">{{ isEditMode ? 'Edit User' : 'New User' }}</h1>
        <p class="mt-2 text-sm text-gray-500">Manage user details and access.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="space-y-6">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Name -->
                <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <div *ngIf="submitted && f['name'].errors" class="text-red-500 text-xs mt-1">Name is required</div>
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <div *ngIf="submitted && f['email'].errors" class="text-red-500 text-xs mt-1">Valid email is required</div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Phone -->
                <div>
                    <label class="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" formControlName="phoneNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                </div>

                <!-- Role -->
                <div>
                    <label class="block text-sm font-medium text-gray-700">Role</label>
                    <select formControlName="role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            <!-- Password (Optional for Edit) -->
             <div>
                <label class="block text-sm font-medium text-gray-700">Password {{ isEditMode ? '(Leave blank to keep current)' : '' }}</label>
                <input type="password" formControlName="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                <div *ngIf="submitted && f['password'].errors" class="text-red-500 text-xs mt-1">Password is required (min 6 chars)</div>
            </div>

          </div>

          <div class="mt-8 flex justify-end gap-3">
             <button type="button" (click)="cancel()" class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
             <button type="submit" [disabled]="loading" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {{ loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User') }}
             </button>
          </div>
          <div *ngIf="error" class="mt-4 text-red-600 text-sm text-center">{{ error }}</div>

        </form>
      </div>
    </div>
  `
})
export class UserFormComponent implements OnInit {
    userForm: FormGroup;
    isEditMode = false;
    userId: number | null = null;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.userForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: [''],
            role: ['user', Validators.required],
            password: [''] // Validators added dynamically
        });
    }

    get f() { return this.userForm.controls; }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.userId = +params['id'];
                this.loadUser(this.userId);
                // Password optional in edit mode
                this.userForm.get('password')?.clearValidators();
                this.userForm.get('password')?.updateValueAndValidity();
            } else {
                // Password required in create mode
                this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
                this.userForm.get('password')?.updateValueAndValidity();
            }
        });
    }

    loadUser(id: number) {
        this.loading = true;
        this.userService.getUserById(id).subscribe({
            next: (user) => {
                this.userForm.patchValue({
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role
                });
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load user';
                this.loading = false;
            }
        });
    }

    onSubmit() {
        this.submitted = true;
        if (this.userForm.invalid) return;

        this.loading = true;
        this.error = '';

        const userData = this.userForm.value;
        // Remove empty password if edit mode
        if (this.isEditMode && !userData.password) {
            delete userData.password;
        }

        const request$ = this.isEditMode
            ? this.userService.updateUser(this.userId!, userData)
            : this.userService.createUser(userData);

        request$.subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/admin/users']);
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Operation failed';
            }
        });
    }

    cancel() {
        this.router.navigate(['/admin/users']);
    }
}
