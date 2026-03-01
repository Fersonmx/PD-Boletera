
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SetupService } from '../../../../core/services/setup.service';

@Component({
    selector: 'app-setup-wizard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        
        <div class="text-center">
            <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Initial Setup
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Configure your Admin user and Payment settings.
            </p>
        </div>

        <div class="flex justify-between items-center mb-6">
            <div class="flex-1">
                <div class="h-2 bg-gray-200 rounded-full">
                    <div class="h-2 bg-indigo-600 rounded-full transition-all duration-300" 
                         [style.width.%]="(step / totalSteps) * 100"></div>
                </div>
            </div>
            <span class="ml-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">Step {{step}} of {{totalSteps}}</span>
        </div>

        <!-- Step 1: Admin User -->
        <form *ngIf="step === 1" [formGroup]="adminForm" (ngSubmit)="nextStep()">
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Create Admin User</h3>
                
                <div>
                    <label for="adminName" class="sr-only">Full Name</label>
                    <input id="adminName" type="text" formControlName="adminName" required 
                           class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                           placeholder="Admin Full Name">
                </div>
                <div>
                    <label for="adminEmail" class="sr-only">Email address</label>
                    <input id="adminEmail" type="email" formControlName="adminEmail" required 
                           class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                           placeholder="Email address">
                </div>
                <div>
                    <label for="adminPassword" class="sr-only">Password</label>
                    <input id="adminPassword" type="password" formControlName="adminPassword" required 
                           class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                           placeholder="Password">
                </div>
            </div>

            <div class="mt-6">
                <button type="submit" [disabled]="adminForm.invalid"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next: Payment Settings
                </button>
            </div>
        </form>

        <!-- Step 2: Stripe Settings -->
        <form *ngIf="step === 2" [formGroup]="stripeForm" (ngSubmit)="completeSetup()">
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Stripe Configuration</h3>
                <p class="text-xs text-gray-500">Enter your Stripe API keys. These can be changed later.</p>

                <div>
                    <label for="stripePublicKey" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Public Key</label>
                    <input id="stripePublicKey" type="text" formControlName="stripePublicKey" 
                           class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                </div>
                
                <div>
                    <label for="stripeSecretKey" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key</label>
                    <input id="stripeSecretKey" type="password" formControlName="stripeSecretKey" 
                           class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                </div>
            </div>

            <div class="mt-6 flex gap-3">
                <button type="button" (click)="prevStep()"
                        class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                    Back
                </button>
                <button type="submit" [disabled]="stripeForm.invalid || loading"
                        class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    <span *ngIf="loading" class="animate-spin mr-2">⏳</span>
                    {{ loading ? 'Completing...' : 'Finish Setup' }}
                </button>
            </div>
             <div *ngIf="error" class="mt-2 text-red-600 text-sm text-center">{{ error }}</div>
        </form>

      </div>
    </div>
  `
})
export class SetupWizardComponent {
    step = 1;
    totalSteps = 2;
    loading = false;
    error: string | null = null;

    adminForm: FormGroup;
    stripeForm: FormGroup;

    constructor(private fb: FormBuilder, private setupService: SetupService, private router: Router) {
        this.adminForm = this.fb.group({
            adminName: ['', Validators.required],
            adminEmail: ['', [Validators.required, Validators.email]],
            adminPassword: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.stripeForm = this.fb.group({
            stripePublicKey: [''],
            stripeSecretKey: ['']
        });
    }

    nextStep() {
        if (this.adminForm.valid) {
            this.step++;
            this.error = null;
        }
    }

    prevStep() {
        this.step--;
        this.error = null;
    }

    completeSetup() {
        if (this.adminForm.invalid) return;

        this.loading = true;
        this.error = null;

        const payload = {
            ...this.adminForm.value,
            ...this.stripeForm.value
        };

        this.setupService.performSetup(payload).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/admin/dashboard']); // Redirect to Admin Dashboard or Login
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.error || 'An error occurred during setup.';
                console.error(err);
            }
        });
    }
}
