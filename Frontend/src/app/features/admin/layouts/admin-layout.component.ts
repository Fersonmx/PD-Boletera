import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex font-sans selection:bg-pink-500 selection:text-white">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 fixed h-full z-10 transition-transform md:translate-x-0 shadow-sm" aria-label="Sidebar">
        <div class="h-full flex flex-col py-6 px-4">
          <div class="flex items-center justify-between mb-10 px-2">
            <a routerLink="/admin" class="flex items-center gap-2">
              <span class="self-center text-xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500">PD_ADMIN</span>
            </a>
            <!-- Mini Lang Switcher -->
            <div class="flex items-center bg-gray-100 rounded-full px-1 py-0.5 scale-90">
                <button (click)="switchLang('es')" [class]="currentLang === 'es' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'" class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all">ES</button>
                <button (click)="switchLang('en')" [class]="currentLang === 'en' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'" class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all">EN</button>
            </div>
          </div>
          
          <ul class="space-y-1 font-medium flex-1">
            <li>
              <a routerLink="/admin/dashboard" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                <i class="fas fa-chart-line w-6 text-center text-lg"></i>
                <span class="ml-3 font-bold text-sm uppercase tracking-wide">{{ 'ADMIN.NAV.DASHBOARD' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/venues" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                <i class="fas fa-map w-6 text-center text-lg"></i>
                <span class="ml-3 font-bold text-sm uppercase tracking-wide">{{ 'ADMIN.NAV.VENUES' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/events" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                <i class="fas fa-calendar-alt w-6 text-center text-lg"></i>
                <span class="ml-3 font-bold text-sm uppercase tracking-wide">{{ 'ADMIN.NAV.EVENTS' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/orders" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                <i class="fas fa-ticket-alt w-6 text-center text-lg"></i>
                <span class="ml-3 font-bold text-sm uppercase tracking-wide">{{ 'ADMIN.NAV.ORDERS' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/users" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                <i class="fas fa-users w-6 text-center text-lg"></i>
                <span class="ml-3 font-bold text-sm uppercase tracking-wide">{{ 'ADMIN.NAV.CUSTOMERS' | translate }}</span>
              </a>
            </li>
            <li>
                <a routerLink="/admin/promos" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                  <i class="fas fa-tags w-6 text-center text-lg"></i>
                  <span class="ml-3 font-bold text-sm uppercase tracking-wide">Promo Codes</span>
                </a>
            </li>
            <li>
                <a routerLink="/admin/slider" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                  <i class="fas fa-images w-6 text-center text-lg"></i>
                  <span class="ml-3 font-bold text-sm uppercase tracking-wide">Hero Slider</span>
                </a>
            </li>
            <li>
                <a routerLink="/admin/pages" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                  <i class="fas fa-file-alt w-6 text-center text-lg"></i>
                  <span class="ml-3 font-bold text-sm uppercase tracking-wide">Content Pages</span>
                </a>
            </li>
            <li>
              <a routerLink="/admin/settings" routerLinkActive="bg-pink-50 text-pink-600 shadow-sm" class="flex items-center p-3 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-pink-600 transition-colors group">
                <i class="fas fa-cog w-6 text-center text-lg"></i>
                <span class="ml-3 font-bold text-sm uppercase tracking-wide">{{ 'ADMIN.NAV.SETTINGS' | translate }}</span>
              </a>
            </li>
          </ul>

          <div class="pt-4 mt-auto border-t border-gray-100">
            <button (click)="logout()" class="flex items-center p-3 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 w-full transition-colors font-bold text-sm uppercase tracking-wide">
              <i class="fas fa-sign-out-alt w-6 text-center text-lg"></i>
              <span class="ml-3">{{ 'NAV.LOGOUT' | translate }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Content -->
      <div class="flex-1 md:ml-64 p-8 md:p-12">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {
  currentLang = 'es';

  constructor(
    private auth: AuthService,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || 'es';
  }

  switchLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  logout() {
    this.auth.logout();
  }
}
