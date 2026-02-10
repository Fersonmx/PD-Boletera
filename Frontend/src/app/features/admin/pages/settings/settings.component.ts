import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../../core/services/setting.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
          <p class="text-gray-500">Manage global application configurations</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
           <h2 class="text-lg font-bold text-gray-900 mb-4">Authentication & Security</h2>
           
           <div class="flex items-center justify-between py-4">
              <div>
                 <h3 class="font-medium text-gray-900">Registration 2FA</h3>
                 <p class="text-sm text-gray-500">Enable SMS Two-Factor Authentication for new user registrations</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" [(ngModel)]="enable2FA" (change)="toggle2FA()">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
           </div>
        </div>
        <!-- Add more settings sections here -->
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  enable2FA = false;

  constructor(private settingService: SettingService) { }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.settingService.getSettings().subscribe({
      next: (settings) => {
        this.enable2FA = settings['enable_2fa_registration'] === 'true';
      },
      error: (err) => console.error(err)
    });
  }

  toggle2FA() {
    this.settingService.updateSetting('enable_2fa_registration', String(this.enable2FA)).subscribe({
      next: () => console.log('Setting updated'),
      error: (err) => {
        console.error(err);
        // Revert on error
        this.enable2FA = !this.enable2FA;
      }
    });
  }
}
