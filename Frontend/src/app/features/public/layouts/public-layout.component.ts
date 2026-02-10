import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-pink-500 selection:text-white">
      <!-- Navbar -->
      <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center gap-2">
              <a routerLink="/" class="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 transition-all">
                PD_Boletera
              </a>
            </div>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex space-x-8 items-center">
              <a routerLink="/events" class="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors relative group">
                {{ 'NAV.CONCERTS' | translate }}
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all group-hover:w-full"></span>
              </a>
              <a routerLink="/events" class="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors relative group">
                {{ 'NAV.SPORTS' | translate }}
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all group-hover:w-full"></span>
              </a>
              <a routerLink="/events" class="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors relative group">
                {{ 'NAV.THEATER' | translate }}
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all group-hover:w-full"></span>
              </a>
            </nav>

            <!-- Actions -->
            <div class="hidden md:flex items-center gap-6">
               <!-- Lang Switcher -->
              <div class="flex items-center bg-gray-100 rounded-full px-1 py-1">
                 <button (click)="switchLang('es')" [class]="currentLang === 'es' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all">ES</button>
                 <button (click)="switchLang('en')" [class]="currentLang === 'en' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'" class="px-3 py-1 rounded-full text-[10px] font-bold transition-all">EN</button>
              </div>

              <div class="h-6 w-px bg-gray-200"></div>

              @if (authService.isAuthenticated) {
                <a routerLink="/profile" class="flex items-center gap-3 group">
                   <div class="text-right hidden lg:block">
                      <p class="text-xs font-bold text-gray-900 leading-none">{{ authService.currentUserSig()?.name }}</p>
                      <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider">My Account</p>
                   </div>
                   <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-pink-200 transition-all ring-2 ring-white">
                     {{ authService.currentUserSig()?.name?.charAt(0) || 'U' }}
                   </div>
                </a>
              } @else {
                <a routerLink="/auth/login" class="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-pink-600 transition-colors">{{ 'NAV.LOGIN' | translate }}</a>
                <a routerLink="/auth/register" class="px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-pink-600 transition-colors shadow-lg hover:shadow-pink-200 transform hover:-translate-y-0.5 duration-200">
                  {{ 'NAV.REGISTER' | translate }}
                </a>
              }
            </div>

            <!-- Mobile Menu Button -->
            <button (click)="toggleMobileMenu()" class="md:hidden p-2 text-gray-600 hover:text-black focus:outline-none">
                <i class="fas fa-bars text-xl" [class.fa-bars]="!isMobileMenuOpen()" [class.fa-times]="isMobileMenuOpen()"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Overlay -->
        @if (isMobileMenuOpen()) {
            <div class="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-6 flex flex-col space-y-4 animate-fadeIn">
                <a routerLink="/events" (click)="closeMobileMenu()" class="text-lg font-bold text-gray-900 py-2 border-b border-gray-50">{{ 'NAV.CONCERTS' | translate }}</a>
                <a routerLink="/events" (click)="closeMobileMenu()" class="text-lg font-bold text-gray-900 py-2 border-b border-gray-50">{{ 'NAV.SPORTS' | translate }}</a>
                <a routerLink="/events" (click)="closeMobileMenu()" class="text-lg font-bold text-gray-900 py-2 border-b border-gray-50">{{ 'NAV.THEATER' | translate }}</a>
                
                <div class="flex items-center justify-between py-4">
                    <span class="text-sm font-bold text-gray-500 uppercase">Language</span>
                    <div class="flex items-center bg-gray-100 rounded-full px-1 py-1">
                        <button (click)="switchLang('es')" [class]="currentLang === 'es' ? 'bg-white text-black shadow-sm' : 'text-gray-400'" class="px-4 py-1.5 rounded-full text-xs font-bold">ES</button>
                        <button (click)="switchLang('en')" [class]="currentLang === 'en' ? 'bg-white text-black shadow-sm' : 'text-gray-400'" class="px-4 py-1.5 rounded-full text-xs font-bold">EN</button>
                    </div>
                </div>

                @if (authService.isAuthenticated) {
                    <a routerLink="/profile" (click)="closeMobileMenu()" class="flex items-center gap-3 py-2 bg-gray-50 rounded-lg px-4">
                        <div class="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">
                            {{ authService.currentUserSig()?.name?.charAt(0) || 'U' }}
                        </div>
                        <span class="font-bold text-gray-900">{{ 'NAV.PROFILE' | translate }}</span>
                    </a>
                } @else {
                    <div class="grid grid-cols-2 gap-4 pt-2">
                        <a routerLink="/auth/login" (click)="closeMobileMenu()" class="flex items-center justify-center py-3 border border-gray-300 rounded-lg font-bold text-gray-900 text-sm uppercase tracking-wider">
                            {{ 'NAV.LOGIN' | translate }}
                        </a>
                        <a routerLink="/auth/register" (click)="closeMobileMenu()" class="flex items-center justify-center py-3 bg-black text-white rounded-lg font-bold text-sm uppercase tracking-wider">
                            {{ 'NAV.REGISTER' | translate }}
                        </a>
                    </div>
                }
            </div>
        }
      </header>

      <!-- Main Content -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-black text-white py-16 border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-12 mb-12">
                <div class="col-span-1 md:col-span-2">
                    <h3 class="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400 mb-6">PD_BOLETERA</h3>
                    <p class="text-gray-400 max-w-sm">{{ 'FOOTER.DESCRIPTION' | translate }}</p>
                </div>
                <div>
                    <h4 class="font-bold uppercase tracking-widest mb-6">{{ 'FOOTER.EXPLORE' | translate }}</h4>
                    <ul class="space-y-4 text-gray-400">
                        <li><a href="#" class="hover:text-white transition">{{ 'FOOTER.LINKS.CONCERTS' | translate }}</a></li>
                        <li><a href="#" class="hover:text-white transition">{{ 'FOOTER.LINKS.SPORTS' | translate }}</a></li>
                        <li><a href="#" class="hover:text-white transition">{{ 'FOOTER.LINKS.THEATER' | translate }}</a></li>
                        <li><a href="#" class="hover:text-white transition">{{ 'FOOTER.LINKS.FESTIVALS' | translate }}</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold uppercase tracking-widest mb-6">{{ 'FOOTER.SUPPORT' | translate }}</h4>
                    <ul class="space-y-4 text-gray-400">
                        <li><a routerLink="/page/help-center" class="hover:text-white transition">{{ 'FOOTER.LINKS.HELP_CENTER' | translate }}</a></li>
                        <li><a routerLink="/page/contact-us" class="hover:text-white transition">{{ 'FOOTER.LINKS.CONTACT_US' | translate }}</a></li>
                        <li><a routerLink="/page/privacy-policy" class="hover:text-white transition">{{ 'FOOTER.LINKS.PRIVACY' | translate }}</a></li>
                        <li><a routerLink="/page/terms-of-service" class="hover:text-white transition">{{ 'FOOTER.LINKS.TERMS' | translate }}</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p class="text-gray-500 text-sm">{{ 'FOOTER.RIGHTS' | translate }} © 2025</p>
               <div class="flex gap-4">
                   <a href="#" class="text-gray-500 hover:text-white transition"><i class="fab fa-twitter"></i></a>
                   <a href="#" class="text-gray-500 hover:text-white transition"><i class="fab fa-instagram"></i></a>
                   <a href="#" class="text-gray-500 hover:text-white transition"><i class="fab fa-facebook"></i></a>
               </div>
            </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PublicLayoutComponent {
  currentLang = 'es';
  isMobileMenuOpen = signal(false);

  constructor(
    private translate: TranslateService,
    public authService: AuthService
  ) {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.currentLang = this.translate.currentLang;
  }

  switchLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
