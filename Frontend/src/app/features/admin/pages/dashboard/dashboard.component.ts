import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight text-gray-900 mb-8">{{ 'ADMIN.NAV.DASHBOARD' | translate }}</h1>
      
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Stat Card 1 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
             <div class="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl">
               <i class="fas fa-dollar-sign"></i>
             </div>
             <span class="text-xs font-bold uppercase tracking-wider text-green-500 bg-green-50 px-2 py-1 rounded-md">+12.5%</span>
          </div>
          <dt class="text-sm font-bold text-gray-500 uppercase tracking-wide">{{ 'ADMIN.DASHBOARD.TOTAL_REVENUE' | translate }}</dt>
          <dd class="mt-1 text-3xl font-black text-gray-900">$71,897</dd>
        </div>

        <!-- Stat Card 2 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
             <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
               <i class="fas fa-ticket-alt"></i>
             </div>
             <span class="text-xs font-bold uppercase tracking-wider text-green-500 bg-green-50 px-2 py-1 rounded-md">+5.2%</span>
          </div>
          <dt class="text-sm font-bold text-gray-500 uppercase tracking-wide">{{ 'ADMIN.DASHBOARD.TOTAL_TICKETS' | translate }}</dt>
          <dd class="mt-1 text-3xl font-black text-gray-900">1,234</dd>
        </div>

        <!-- Stat Card 3 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
           <div class="flex items-center justify-between mb-4">
             <div class="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center text-xl">
               <i class="fas fa-calendar-check"></i>
             </div>
             <span class="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{{ 'ADMIN.DASHBOARD.STABLE' | translate }}</span>
          </div>
          <dt class="text-sm font-bold text-gray-500 uppercase tracking-wide">{{ 'ADMIN.DASHBOARD.ACTIVE_EVENTS' | translate }}</dt>
          <dd class="mt-1 text-3xl font-black text-gray-900">24</dd>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent { }
