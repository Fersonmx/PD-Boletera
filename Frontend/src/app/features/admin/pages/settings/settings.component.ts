import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingService } from '../../../../core/services/setting.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ 'ADMIN.SETTINGS.TITLE' | translate }}</h1>
          <p class="text-gray-500">{{ 'ADMIN.SETTINGS.DESC' | translate }}</p>
        </div>
      </div>

      <div class="space-y-6">
          <!-- Auth & Security -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6">
               <h2 class="text-lg font-bold text-gray-900 mb-4">{{ 'ADMIN.SETTINGS.AUTH_TITLE' | translate }}</h2>
               
               <div class="flex items-center justify-between py-4">
                  <div>
                     <h3 class="font-medium text-gray-900">{{ 'ADMIN.SETTINGS.2FA_LABEL' | translate }}</h3>
                     <p class="text-sm text-gray-500">{{ 'ADMIN.SETTINGS.2FA_DESC' | translate }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" [(ngModel)]="enable2FA" (change)="toggle2FA()">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
               </div>
            </div>
          </div>

          <!-- Email Configuration (SMTP) -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 class="text-lg font-bold text-gray-900">{{ 'ADMIN.SETTINGS.SMTP.TITLE' | translate }}</h2>
                <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded ring-1 ring-blue-200">System Emails</span>
            </div>
            
            <div class="p-6 space-y-4">
                <p class="text-sm text-gray-500 mb-4">{{ 'ADMIN.SETTINGS.SMTP.DESC' | translate }}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Host -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.SETTINGS.SMTP.HOST' | translate }}</label>
                        <input type="text" [(ngModel)]="smtpConfig.smtp_host" placeholder="smtp.gmail.com" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    </div>
                    <!-- Port -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.SETTINGS.SMTP.PORT' | translate }}</label>
                        <input type="number" [(ngModel)]="smtpConfig.smtp_port" placeholder="587" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    </div>
                    <!-- Username -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.SETTINGS.SMTP.USER' | translate }}</label>
                        <input type="email" [(ngModel)]="smtpConfig.smtp_user" placeholder="admin@example.com" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    </div>
                    <!-- Password -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.SETTINGS.SMTP.PASS' | translate }}</label>
                        <input type="password" [(ngModel)]="smtpConfig.smtp_pass" placeholder="••••••••" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    </div>
                    <!-- From Email / Name -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.SETTINGS.SMTP.FROM' | translate }}</label>
                        <input type="text" [(ngModel)]="smtpConfig.smtp_from" placeholder="&quot;Boletera Contact&quot; <noreply@example.com>" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    </div>
                    <!-- Test Email & Save Config -->
                    <div class="md:col-span-2 pt-4 border-t border-gray-100 mt-2 flex flex-col md:flex-row justify-between gap-4">
                        <div class="flex-1">
                          <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'ADMIN.SETTINGS.SMTP.TEST_EMAIL' | translate }}</label>
                          <div class="flex gap-2">
                              <input type="email" [(ngModel)]="testEmailAddress" placeholder="you@example.com" class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                              <button (click)="testSMTPConfig()" [disabled]="isTesting" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-50 whitespace-nowrap">
                                  @if(isTesting) {
                                      <i class="fas fa-spinner fa-spin mr-2"></i> {{ 'ADMIN.SETTINGS.SMTP.TESTING' | translate }}
                                  } @else {
                                      <i class="fas fa-paper-plane mr-2"></i> {{ 'ADMIN.SETTINGS.SMTP.BTN_TEST' | translate }}
                                  }
                              </button>
                          </div>
                      </div>
                      <div class="flex items-end">
                         <button (click)="saveSMTPConfig()" [disabled]="isSaving" class="px-6 py-2 w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition disabled:opacity-50 whitespace-nowrap h-[42px]">
                            @if(isSaving) {
                               <i class="fas fa-spinner fa-spin mr-2"></i> {{ 'ADMIN.SETTINGS.SMTP.SAVING' | translate }}
                            } @else {
                               <i class="fas fa-save mr-2"></i> {{ 'ADMIN.SETTINGS.SMTP.SAVE' | translate }}
                            }
                         </button>
                      </div>
                    </div>
                </div>

                @if(alertMessage) {
                    <div class="mt-4 p-4 rounded-lg" [ngClass]="{'bg-green-50 text-green-800 border-green-200': alertType === 'success', 'bg-red-50 text-red-800 border-red-200': alertType === 'error'}">
                        <p class="text-sm font-medium">{{ alertMessage }}</p>
                    </div>
                }

          <!-- Template Management -->
          <div class="bg-violet-50 rounded-xl p-6 border border-violet-100 flex justify-between items-center text-violet-900 mt-6 shadow-sm">
             <div>
                 <h2 class="text-lg font-bold mb-1"><i class="fas fa-envelope-open-text mr-2 text-violet-600"></i>Plantillas y Traducción de Correos</h2>
                 <p class="text-sm text-violet-700/80">Configura y traduce los mensajes automáticos de recuperación, compra y bienvenida.</p>
             </div>
             <a routerLink="/admin/settings/templates" class="px-5 py-2 inline-block bg-white text-violet-600 font-bold border border-violet-200 rounded-lg hover:bg-gray-50 transition shadow-sm whitespace-nowrap">
                 Ver Plantillas <i class="fas fa-arrow-right ml-2 text-xs"></i>
             </a>
          </div>

          <!-- Link to external logs -->
          <div class="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex justify-between items-center text-indigo-900 mt-6 shadow-sm">
             <div>
                 <h2 class="text-lg font-bold mb-1"><i class="fas fa-list-alt mr-2 text-indigo-600"></i>{{ 'ADMIN.SETTINGS.EMAIL_LOGS.TITLE' | translate }}</h2>
                 <p class="text-sm text-indigo-700/80">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.DESC' | translate }}</p>
             </div>
             <a routerLink="/admin/settings/logs" class="px-5 py-2 inline-block bg-white text-indigo-600 font-bold border border-indigo-200 rounded-lg hover:bg-gray-50 transition shadow-sm whitespace-nowrap">
                 Ver Logs Completos <i class="fas fa-arrow-right ml-2 text-xs"></i>
             </a>
          </div>

      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  enable2FA = false;

  // SMTP Configuration State
  smtpConfig = {
    smtp_host: '',
    smtp_port: null as number | null,
    smtp_user: '',
    smtp_pass: '',
    smtp_from: ''
  };

  testEmailAddress = '';
  isSaving = false;
  isTesting = false;
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  constructor(private settingService: SettingService) { }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.settingService.getSettings().subscribe({
      next: (settings) => {
        this.enable2FA = settings['enable_2fa_registration'] === 'true';
        this.smtpConfig = {
          smtp_host: settings['smtp_host'] || '',
          smtp_port: settings['smtp_port'] ? Number(settings['smtp_port']) : null,
          smtp_user: settings['smtp_user'] || '',
          smtp_pass: settings['smtp_pass'] || '',
          smtp_from: settings['smtp_from'] || ''
        };
      },
      error: (err) => console.error(err)
    });
  }


  toggle2FA() {
    this.settingService.updateSetting('enable_2fa_registration', String(this.enable2FA)).subscribe({
      next: () => console.log('Setting updated'),
      error: (err) => {
        console.error(err);
        this.enable2FA = !this.enable2FA;
      }
    });
  }

  saveSMTPConfig() {
    this.isSaving = true;
    this.alertMessage = '';

    const updates = [
      ...Object.entries(this.smtpConfig)
    ].map(([key, value]) =>
      this.settingService.updateSetting(key, String(value || '')).toPromise()
    );

    Promise.all(updates).then(() => {
      this.isSaving = false;
      this.showAlert('success', 'Configuration saved successfully.');
    }).catch(err => {
      console.error('Error saving SMTP/Welcome logic', err);
      this.isSaving = false;
      this.showAlert('error', 'Failed to save configuration. Check console.');
    });
  }

  testSMTPConfig() {
    if (!this.testEmailAddress) {
      this.showAlert('error', 'Please enter a test email address.');
      return;
    }

    this.isTesting = true;
    this.alertMessage = '';

    const testPayload = {
      ...this.smtpConfig,
      test_email: this.testEmailAddress
    };

    this.settingService.testEmail(testPayload).subscribe({
      next: (res) => {
        this.isTesting = false;
        this.showAlert('success', 'Test email sent successfully! Please check your inbox.');
      },
      error: (err) => {
        this.isTesting = false;
        this.showAlert('error', err.error?.message || 'Failed to send test email. Verify your credentials and port settings.');
      }
    });
  }

  showAlert(type: 'success' | 'error', message: string) {
    this.alertType = type;
    this.alertMessage = message;
    setTimeout(() => this.alertMessage = '', 8000);
  }
}
