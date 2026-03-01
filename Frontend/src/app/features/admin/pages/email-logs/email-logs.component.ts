import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingService } from '../../../../core/services/setting.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-email-logs',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
    template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.TITLE' | translate }}</h1>
          <p class="text-gray-500">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.DESC' | translate }}</p>
        </div>
        <a routerLink="/admin/settings" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            <i class="fas fa-arrow-left mr-2"></i> Back to Settings
        </a>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 class="text-lg font-bold text-gray-900">Historial</h2>
            
            <div class="flex items-center gap-2 w-full sm:w-auto">
                <select [(ngModel)]="logFilters.type" (change)="loadEmailLogs()" class="px-3 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-pink-500">
                    <option value="">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.FILTER_ALL_TYPES' | translate }}</option>
                    <option value="Registration">Registration</option>
                    <option value="Order">Order</option>
                    <option value="PasswordRecovery">PasswordRecovery</option>
                    <option value="Test">Test</option>
                    <option value="Other">Other</option>
                </select>

                <select [(ngModel)]="logFilters.status" (change)="loadEmailLogs()" class="px-3 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-pink-500">
                    <option value="">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.FILTER_ALL_STATUS' | translate }}</option>
                    <option value="Sent">Sent</option>
                    <option value="Failed">Failed</option>
                </select>

                <button (click)="loadEmailLogs()" class="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border hover:bg-gray-100 transition whitespace-nowrap"><i class="fas fa-sync-alt mr-1"></i> {{ 'ADMIN.SETTINGS.EMAIL_LOGS.REFRESH' | translate }}</button>
            </div>
        </div>
        <div class="p-0">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.TH_DATE' | translate }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.TH_TYPE' | translate }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.TH_TO' | translate }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.TH_SUBJECT' | translate }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.TH_STATUS' | translate }}</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @for (log of emailLogs; track log.id) {
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.createdAt | date:'short' }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">{{ log.type }}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ log.toEmail }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.subject }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                        [ngClass]="{'bg-green-100 text-green-800': log.status === 'Sent', 'bg-red-100 text-red-800': log.status === 'Failed'}">
                                        {{ log.status }}
                                    </span>
                                    @if(log.error) {
                                        <p class="text-xs text-red-500 mt-1 max-w-xs truncate" [title]="log.error">{{ log.error }}</p>
                                    }
                                </td>
                            </tr>
                        }
                        @if(emailLogs.length === 0) {
                            <tr>
                                <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">{{ 'ADMIN.SETTINGS.EMAIL_LOGS.EMPTY' | translate }}</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  `
})
export class EmailLogsComponent implements OnInit {
    logFilters = {
        type: '',
        status: ''
    };

    emailLogs: any[] = [];

    constructor(private settingService: SettingService) { }

    ngOnInit() {
        this.loadEmailLogs();
    }

    loadEmailLogs() {
        this.settingService.getEmailLogs(this.logFilters.type, this.logFilters.status).subscribe({
            next: (logs) => this.emailLogs = logs,
            error: (err) => console.error('Failed to load email logs', err)
        });
    }
}
