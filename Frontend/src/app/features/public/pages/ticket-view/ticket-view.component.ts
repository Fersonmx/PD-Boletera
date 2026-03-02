import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { TicketService } from '../../../../core/services/ticket.service';

import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';


import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-ticket-view',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-900 py-12 flex flex-col items-center justify-center selection:bg-pink-500 selection:text-white">
      <div class="w-full max-w-md px-4">
        
        <div class="mb-6 text-center">
           <a routerLink="/profile" class="text-pink-400 hover:text-pink-300 font-bold mb-4 inline-block">&larr; {{ 'TICKET.BACK_TO_PROFILE' | translate }}</a>
           <h1 class="text-3xl font-extrabold text-white">{{ 'TICKET.YOUR_TICKET' | translate }}</h1>
        </div>

        @if (isLoading()) {
            <div class="bg-white rounded-3xl p-8 flex justify-center">
                 <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        } @else if (order()) {
            <!-- Slider Controls -->
             <div *ngIf="order()?.OrderTickets?.length > 1" class="flex justify-between items-center mb-4 text-white">
                <button (click)="prevTicket()" [disabled]="currentTicketIndex() === 0" class="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition">
                    <i class="fas fa-chevron-left text-2xl"></i>
                </button>
                <span class="text-sm font-medium tracking-wide">
                    {{ currentTicketIndex() + 1 }} / {{ order()?.OrderTickets?.length }}
                </span>
                <button (click)="nextTicket()" [disabled]="currentTicketIndex() === order()?.OrderTickets?.length - 1" class="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition">
                    <i class="fas fa-chevron-right text-2xl"></i>
                </button>
            </div>

            <!-- Single Ticket Card (Current Index) -->
            @if (currentTicket()) {
                <div class="bg-white rounded-3xl overflow-hidden shadow-2xl mb-8 relative transform hover:scale-[1.02] transition-transform duration-300">
                    <!-- Event Image Header -->
                    <div class="h-48 bg-gray-200 relative">
                        <img [src]="getImageUrl(currentTicket()?.Ticket?.Event?.imageUrl) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="absolute bottom-4 left-6 text-white">
                            <p class="text-sm font-bold uppercase tracking-wider opacity-80">{{ currentTicket()?.Ticket?.Event?.Category?.name }}</p>
                            <h2 class="text-2xl font-black leading-tight">{{ currentTicket()?.Ticket?.Event?.title }}</h2>
                        </div>
                    </div>

                    <!-- Ticket Details -->
                    <div class="p-6">
                        <div class="flex justify-between items-end mb-6">
                            <div>
                                <p class="text-xs text-gray-500 uppercase tracking-widest font-bold">{{ 'TICKET.DATE' | translate }}</p>
                                <p class="text-lg font-bold text-gray-900">{{ currentTicket()?.Ticket?.Event?.date | date:'mediumDate':'':currentLang() }}</p>
                                <p class="text-sm text-gray-600">{{ currentTicket()?.Ticket?.Event?.date | date:'shortTime':'':currentLang() }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-gray-500 uppercase tracking-widest font-bold">{{ 'TICKET.VENUE' | translate }}</p>
                                <p class="text-sm font-bold text-gray-900">{{ currentTicket()?.Ticket?.Event?.Venue?.name }}</p>
                                <p class="text-xs text-gray-600">{{ currentTicket()?.Ticket?.Event?.Venue?.city }}</p>
                            </div>
                        </div>

                        <div class="border-t border-dashed border-gray-300 my-6"></div>

                        <div class="flex justify-between items-center mb-6">
                             <div>
                                <p class="text-xs text-gray-500 uppercase tracking-widest font-bold">{{ 'TICKET.TYPE' | translate }}</p>
                                <p class="text-xl font-black text-pink-600">{{ currentTicket()?.Ticket?.name }}</p>
                             </div>
                             <div class="text-right">
                                <p class="text-xs text-gray-500 uppercase tracking-widest font-bold">TICKET ID</p>
                                <p class="text-sm font-mono text-gray-700">#{{ currentTicket()?.uniqueCode?.substring(0, 8) }}</p>
                             </div>
                        </div>

                        <!-- Scan QR Code -->
                        <div class="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border border-gray-100 min-h-[300px]">
                           @if (dynamicStatus() === 'locked') {
                              <div class="text-center p-4">
                                  <i class="fas fa-lock text-4xl text-gray-300 mb-3"></i>
                                  <p class="text-sm font-bold text-gray-700 uppercase mb-1">Security Lock</p>
                                  <p class="text-xs text-gray-500 mb-4">{{ lockedMessage() }}</p>
                                  <div class="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                      <i class="fas fa-clock text-gray-400 text-xs"></i>
                                      <span class="text-xs font-mono font-bold text-gray-600">{{ availabilityText() }}</span>
                                  </div>
                              </div>
                           } @else if (qrCodeData()) {
                             <img [src]="'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + qrCodeData()" alt="QR Code" class="w-48 h-48 mix-blend-multiply opacity-90">
                             
                             @if (dynamicStatus() === 'dynamic') {
                                <div class="mt-4 flex flex-col items-center animate-pulse">
                                    <p class="text-[10px] text-center text-blue-500 font-bold uppercase tracking-widest mb-1">
                                        <i class="fas fa-shield-alt mr-1"></i> Secure Object
                                    </p>
                                    <p class="text-[10px] text-gray-400">Refreshes automatically</p>
                                </div>
                             } @else {
                                <p class="mt-4 text-xs text-center text-gray-400 font-mono tracking-widest">{{ currentTicket()?.uniqueCode }}</p>
                             }

                             <p class="text-xs text-green-600 font-bold mt-2 uppercase tracking-wide">Valid Ticket</p>
                           } @else {
                              <div class="animate-pulse flex flex-col items-center">
                                  <div class="h-48 w-48 bg-gray-200 rounded-lg mb-2"></div>
                                  <div class="h-4 w-32 bg-gray-200 rounded"></div>
                              </div>
                           }
                        </div>

                        <!-- Wallet Integration (Static Only) -->
                        @if (currentTicket() && !currentTicket()?.Ticket?.Event?.isDynamicQr) {
                            <div class="mt-6 flex flex-col sm:flex-row gap-3">
                                <a [href]="getAppleWalletUrl(currentTicket().id)" target="_blank" class="flex-1 bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition font-bold text-sm">
                                    <i class="fab fa-apple text-xl"></i> 
                                    <span>Apple Wallet</span>
                                </a>
                                <button (click)="addToGoogleWallet(currentTicket().id)" class="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition font-bold text-sm">
                                    <i class="fab fa-google text-xl text-blue-500"></i>
                                    <span>Google Pay</span>
                                </button>
                            </div>
                        }

                    </div>
                    
                    <!-- Decorative Circles styling for 'tear-off' effect -->
                    <div class="absolute top-48 -left-3 w-6 h-6 bg-gray-900 rounded-full"></div>
                    <div class="absolute top-48 -right-3 w-6 h-6 bg-gray-900 rounded-full"></div>
                </div>
            }
        } @else {
            <div class="text-center text-white">
                <p>Ticket details not found.</p>
            </div>
        }

      </div>
    </div>
  `
})
export class TicketViewComponent implements OnInit, OnDestroy {
  order = signal<any>(null);
  isLoading = signal<boolean>(true);
  currentLang = signal<string>('es');

  currentTicketIndex = signal<number>(0);
  currentTicket = computed(() => {
    const tickets = this.order()?.OrderTickets;
    if (!tickets || tickets.length === 0) return null;
    return tickets[this.currentTicketIndex()];
  });

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private ticketService: TicketService,
    private translate: TranslateService
  ) {
    this.currentLang.set(this.translate.currentLang || 'es');
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang.set(event.lang);
    });
  }

  nextTicket() {
    if (this.currentTicketIndex() < (this.order()?.OrderTickets?.length || 0) - 1) {
      this.stopPolling();
      this.currentTicketIndex.update(i => i + 1);
      this.checkDynamicQr(this.currentTicket());
    }
  }

  prevTicket() {
    if (this.currentTicketIndex() > 0) {
      this.stopPolling();
      this.currentTicketIndex.update(i => i - 1);
      this.checkDynamicQr(this.currentTicket());
    }
  }

  // --- Dynamic QR Logic ---
  pollingInterval: any;
  qrCodeData = signal<string>(''); // Actual string to render
  dynamicStatus = signal<'static' | 'dynamic' | 'locked'>('static');
  lockedMessage = signal<string>('');
  availableInMinutes = signal<number>(0);

  availabilityText = computed(() => {
    const mins = this.availableInMinutes();
    const lang = this.currentLang();
    const oneDay = 1440; // 24 * 60

    if (mins >= oneDay) {
      const days = Math.floor(mins / oneDay);
      if (lang === 'es') return `Disponible en ${days} día${days !== 1 ? 's' : ''}`;
      return `Available in ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(mins / 60);
      const m = mins % 60;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      if (lang === 'es') return `Disponible en ${hours}h ${mStr}m`;
      return `Available in ${hours}h ${mStr}m`;
    }
  });

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      // Fetch Order first
      this.orderService.getMyOrders().subscribe(orders => {
        const found = orders.find((o: any) => o.id == +orderId); // Ensure numeric comparison
        if (found) {
          this.order.set(found);
          this.isLoading.set(false);
          // Init first ticket check
          setTimeout(() => this.checkDynamicQr(this.currentTicket()), 100);
        } else {
          this.isLoading.set(false);
        }
      });
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Call this whenever the current ticket changes
  checkDynamicQr(ticket: any) {
    if (!ticket) return;

    // Reset state
    this.stopPolling();
    this.qrCodeData.set('');
    this.dynamicStatus.set('static');
    console.log('Checking ticket:', ticket.id);

    // Optimistic check: if we know event is NOT dynamic (needs data from include), we can skip.
    // But OrderTickets->Ticket->Event should be populated.
    const event = ticket.Ticket?.Event;

    if (event && !event.isDynamicQr) {
      // Static Mode
      console.log('Static Ticket detected');
      this.qrCodeData.set(ticket.uniqueCode);
      return;
    }

    console.log('Dynamic Ticket detected, fetching secure code...');
    // Dynamic Mode: Initial Fetch
    this.fetchSecureCode(ticket.id);
  }

  fetchSecureCode(ticketId: number) {
    this.ticketService.getSecureCode(ticketId).subscribe({
      next: (res: any) => {
        console.log('Secure Code Resp:', res);
        this.dynamicStatus.set(res.type);

        if (res.type === 'static') {
          this.qrCodeData.set(res.code);
        } else if (res.type === 'locked') {
          this.lockedMessage.set(res.message);
          this.availableInMinutes.set(res.availableInMinutes);
          this.qrCodeData.set(''); // No QR
        } else if (res.type === 'dynamic') {
          this.qrCodeData.set(res.code);

          // Auto refresh before validFor expires (e.g. 5s before) or 1 minute default
          if (!this.pollingInterval) {
            const validSeconds = res.validFor || 300;
            const refreshMs = (validSeconds - 10) * 1000;

            this.pollingInterval = setInterval(() => {
              console.log('Refreshing secure code...');
              this.fetchSecureCode(ticketId);
            }, refreshMs > 0 ? refreshMs : 60000);
          }
        }
      },
      error: (err: any) => {
        console.error("Failed to fetch secure code", err);
        // Fallback to static if server fails? Or show error?
        // For security, better to show error.
      }
    });
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) {
      path = '/api' + path;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  getAppleWalletUrl(ticketId: number): string {
    return this.ticketService.getAppleWalletUrl(ticketId);
  }

  addToGoogleWallet(ticketId: number) {
    this.ticketService.getGoogleWalletUrl(ticketId).subscribe({
      next: (res: any) => {
        if (res.url) {
          window.open(res.url, '_blank');
        }
      },
      error: (err: any) => console.error("Google Wallet Error", err)
    });
  }
}
