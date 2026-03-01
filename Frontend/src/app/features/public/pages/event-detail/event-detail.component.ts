import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService, Event, Ticket } from '../../../../core/services/event.service';
import { OrderService, OrderItem } from '../../../../core/services/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { VenueSection } from '../../../../core/services/venue.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, TranslateModule],
  template: `
    @if (isLoading()) {
      <div class="flex items-center justify-center min-h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    } @else if (event()) {
      <div class="bg-white min-h-screen pb-12">
        <!-- Header / Hero (Redesigned) -->
        <div class="relative bg-black overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
          <!-- Background Effects -->
          <div class="absolute inset-0 z-0 select-none pointer-events-none">
              <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-pink-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-30"></div>
              <div class="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black"></div>
          </div>

          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
              <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                  <!-- Text Content -->
                  <div class="flex-1 text-center lg:text-left space-y-8">
                      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6337ff]/10 border border-[#6337ff]/20 text-[#6337ff] text-sm font-bold tracking-wider uppercase backdrop-blur-sm">
                          <i class="fas fa-star text-xs"></i>
                          <span>{{ event()?.Category?.name || 'Event' }}</span>
                      </div>
                      
                      <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                          {{ event()?.title }}
                      </h1>
                      
                      <div class="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-8 text-gray-300 text-lg font-medium">
                           <div class="flex items-center gap-4 group">
                              <div class="w-12 h-12 rounded-2xl bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-[#6337ff] shadow-lg group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                                   <i class="far fa-calendar-alt text-xl"></i>
                              </div>
                               <div class="text-left">
                                <span class="block text-xs uppercase text-gray-500 font-bold tracking-wider">{{ 'EVENT_DETAIL.DATE' | translate }}</span>
                                <span class="text-white">{{ event()?.date | date:'fullDate':'':currentLang() }}</span>
                              </div>
                           </div>
                           
                           <div class="flex items-center gap-4 group">
                              <div class="w-12 h-12 rounded-2xl bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-indigo-400 shadow-lg group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                                   <i class="fas fa-map-marker-alt text-xl"></i>
                              </div>
                              <div class="text-left">
                                  <span class="block text-xs uppercase text-gray-500 font-bold tracking-wider">{{ 'EVENT_DETAIL.VENUE' | translate }}</span>
                                  <span class="block text-white leading-tight">{{ event()?.Venue?.name }}</span>
                                  <span class="text-sm text-gray-500">{{ event()?.Venue?.city }}</span>
                              </div>
                           </div>
                      </div>
                  </div>

                  <!-- Striking Hero Image -->
                  <div class="flex-1 relative w-full max-w-lg lg:max-w-xl [perspective:1000px]">
                       <!-- Decorative Glow -->
                       <div class="absolute inset-0 bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 blur-2xl opacity-50 transform scale-95 translate-y-4 rounded-[2rem]"></div>
                       
                       <!-- Main Image Card -->
                       <div class="relative bg-gray-900 rounded-[2rem] p-2 border border-white/10 shadow-2xl overflow-hidden transform transition-all duration-700 hover:rotate-1 hover:scale-[1.02]">
                           <img [src]="getImageUrl(event()?.imageUrl) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'" 
                                (error)="onImageError($event)"
                                class="w-full aspect-[4/3] object-cover rounded-[1.5rem] shadow-inner"
                                alt="Event Image">
                            
                           <!-- Floating Badge -->
                           <div class="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-black font-black px-4 py-2 rounded-xl shadow-lg border border-white/50 z-10 flex flex-col items-center">
                                <span class="text-xs uppercase tracking-widest text-gray-500">{{ 'EVENT_DETAIL.STARTS_AT' | translate }}</span>
                                <span class="text-xl">{{ getMinPrice(event()!) | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</span>
                           </div>
                       </div>
                  </div>
              </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <!-- Main Content: Map & Tickets -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Interactive Map Section -->
             @if (event()?.VenueLayout && hasVisualSections() && event()?.showMap !== false) {
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
                    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 z-20 relative">
                        <h3 class="font-bold text-gray-900">{{ 'EVENT_DETAIL.MAP_TITLE' | translate }}</h3>
                        <div class="flex items-center gap-4 text-xs font-medium text-gray-500">
                             <div class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-green-500"></span> {{ 'EVENT_DETAIL.MAP_LEGEND.AVAILABLE' | translate }}</div>
                             <div class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-gray-300"></span> {{ 'EVENT_DETAIL.MAP_LEGEND.SOLD_OUT' | translate }}</div>
                             <div class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-pink-600"></span> {{ 'EVENT_DETAIL.MAP_LEGEND.SELECTED' | translate }}</div>
                        </div>
                    </div>

                    <!-- Map Container -->
                    <div class="relative w-full h-[500px] bg-gray-100 overflow-hidden cursor-move border-b border-gray-200"
                         (mousedown)="startPan($event)"
                         (mousemove)="pan($event)"
                         (mouseup)="endPan()"
                         (mouseleave)="endPan()"
                         (wheel)="onWheel($event)"
                         (contextmenu)="$event.preventDefault()">
                         
                        <!-- Controls -->
                         <div class="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button (click)="zoomIn()" class="p-2 hover:bg-gray-100 rounded text-gray-600" title="Zoom In"><i class="fas fa-plus"></i></button>
                            <button (click)="zoomOut()" class="p-2 hover:bg-gray-100 rounded text-gray-600" title="Zoom Out"><i class="fas fa-minus"></i></button>
                            <button (click)="resetView()" class="p-2 hover:bg-gray-100 rounded text-gray-600" title="Reset"><i class="fas fa-compress"></i></button>
                         </div>
                    
                        <!-- Scrollable Layout -->
                        <div [style.transform]="'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')'" 
                             class="w-full h-full origin-top-left transition-transform duration-75 will-change-transform flex items-center justify-center">
                             
                             <div class="relative" style="max-width: none;"> 
                                 <!-- Background Image -->
                                 @if (event()?.VenueLayout?.imageUrl) {
                                    <img [src]="event()?.VenueLayout?.imageUrl" 
                                         (load)="onImageLoad($event)"
                                         class="block max-w-none h-auto select-none pointer-events-none"
                                         style="min-width: 100%;"> 
                                 }
                                
                                <svg [attr.viewBox]="mapViewBox()" class="absolute inset-0 w-full h-full z-10">
                                     @for (section of event()?.VenueLayout?.sections; track section.id) {
                                        @if (section.visualData) {
                                            <path [attr.d]="section.visualData" 
                                                  (click)="onSectionClick(section)"
                                                  [class]="getSectionClass(section)"
                                                  class="transition-all duration-300 stroke-white stroke-2 pointer-events-auto">
                                                  @if (getSectionTooltip(section)) {
                                                      <title>{{ getSectionTooltip(section) }}</title>
                                                  }
                                            </path>
                                        }
                                     }
                                </svg>
                             </div>
                        </div>
                    </div>
                     <p class="text-center text-xs text-gray-400 p-2 bg-gray-50 border-t border-gray-100">
                        <i class="fas fa-hand-pointer mr-1"></i> {{ 'EVENT_DETAIL.MAP_INSTRUCTIONS' | translate }}
                     </p>
                </div>
             }


            <!-- Tickets List -->
            <div>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">{{ 'EVENT_DETAIL.SELECT_TICKETS' | translate }}</h2>
                    @if (activeTier()) {
                        <div class="px-4 py-1.5 bg-[#6337ff] text-white rounded-full text-sm font-bold uppercase tracking-wider shadow-md animate-pulse">
                            <i class="fas fa-clock mr-2"></i> Phase: {{ activeTier()?.name }}
                        </div>
                    }
                </div>
                
                @if (event()?.tiers?.length && !activeTier()) {
                    <div class="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center">
                        <i class="fas fa-hourglass-start text-4xl text-gray-400 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Ticket Sales Not Active</h3>
                        <p class="text-gray-500">Please check back later for the next sales phase.</p>
                    </div>
                }

                <div class="space-y-4">
                    @for (ticket of displayedTickets(); track ticket.id) {
                    <div class="border border-gray-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:border-pink-500 transition-colors shadow-sm bg-white"
                         [class.ring-2]="isSectionSelected(ticket.sectionId)" [class.ring-pink-500]="isSectionSelected(ticket.sectionId)">
                        <div class="mb-4 sm:mb-0">
                        <h3 class="text-lg font-bold text-gray-900">{{ ticket.name }}</h3>
                        <p class="text-sm text-gray-500">{{ getSectionName(ticket.sectionId) }}</p>
                        <p class="text-sm text-green-600 font-medium mt-1">
                            <i class="fas fa-check-circle mr-1"></i> {{ 'EVENT_DETAIL.AVAILABLE' | translate }}: {{ ticket.available }}
                        </p>
                        </div>
                        <div class="text-right flex items-center gap-6">
                        <div class="text-2xl font-bold text-gray-900">{{ ticket.price | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</div>
                        
                        <!-- Quantity Controls -->
                        <div class="flex items-center border border-gray-300 rounded-md">
                            <button (click)="decreaseQty(ticket.id)" class="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50" [disabled]="getQty(ticket.id) === 0">-</button>
                            <span class="px-3 font-medium min-w-[30px] text-center">{{ getQty(ticket.id) }}</span>
                            <button (click)="increaseQty(ticket.id, ticket.available)" class="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50" [disabled]="getQty(ticket.id) >= ticket.available">+</button>
                        </div>
                        </div>
                    </div>
                    }
    
                    @if (!displayedTickets().length && (!event()?.tiers?.length || (event()?.tiers && activeTier()))) {
                    <div class="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
                        {{ 'EVENT_DETAIL.NO_TICKETS' | translate }}
                    </div>
                    }
                </div>
            </div>
          </div>

          <!-- Checkout / Info Sidebar -->
          <div class="lg:col-span-1">
              <div class="bg-gray-50 rounded-xl p-6 sticky top-24 shadow-sm border border-gray-200">
              <h3 class="text-lg font-bold text-gray-900 mb-4">{{ 'EVENT_DETAIL.SUMMARY' | translate }}</h3>
              
              <!-- Cart Items -->
              @if (totalItems() > 0) {
                 <div class="space-y-3 mb-6 border-b border-gray-200 pb-4">
                    @for (item of cartItems(); track item.ticketId) {
                        @if (item.quantity > 0) {
                            <div class="flex justify-between text-sm group">
                                <div>
                                    <span class="block font-medium text-gray-900">{{ getTicketName(item.ticketId) }}</span>
                                    <span class="text-xs text-gray-500">{{ 'EVENT_DETAIL.QTY' | translate }}: {{item.quantity}}</span>
                                </div>
                                <div class="text-right">
                                    <span class="font-bold">{{ getTicketPrice(item.ticketId) * item.quantity | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</span>
                                    <button (click)="removeItem(item.ticketId)" class="block text-xs text-pink-500 hover:underline ml-auto mt-1">{{ 'EVENT_DETAIL.REMOVE' | translate }}</button>
                                </div>
                            </div>
                        }
                    }
                 </div>
                 
                 <div class="flex justify-between text-xl font-bold text-gray-900 mb-6">
                    <span>{{ 'EVENT_DETAIL.TOTAL' | translate }}</span>
                    <span>{{ totalPrice() | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</span>
                 </div>

                 <button (click)="startCheckout()" [disabled]="isProcessing()" class="w-full py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-200 transform hover:-translate-y-0.5 active:translate-y-0">
                    {{ isProcessing() ? ('EVENT_DETAIL.CHECKOUT_PROCESSING' | translate) : ('EVENT_DETAIL.CHECKOUT' | translate) }}
                 </button>
              } @else {
                  <div class="text-center py-8">
                       <i class="fas fa-ticket-alt text-4xl text-gray-300 mb-3"></i>
                       <p class="text-gray-500 text-sm mb-4">{{ 'EVENT_DETAIL.SELECT_TO_PROCEED' | translate }}</p>
                  </div>
                  <button disabled class="w-full py-3 bg-gray-200 text-gray-400 rounded-lg font-bold cursor-not-allowed">
                    {{ 'EVENT_DETAIL.CHECKOUT' | translate }}
                  </button>
              }
              
              <div class="mt-6 pt-4 border-t border-gray-200">
                 <div class="flex items-center gap-2 justify-center text-gray-400 mb-2">
                    <i class="fab fa-cc-visa text-2xl"></i>
                    <i class="fab fa-cc-mastercard text-2xl"></i>
                    <i class="fab fa-cc-amex text-2xl"></i>
                 </div>
                 <p class="text-xs text-gray-500 text-center">
                   {{ 'EVENT_DETAIL.SECURE_CHECKOUT' | translate }} <br>
                   {{ 'EVENT_DETAIL.BUYER_GUARANTEE' | translate }}
                 </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    } @else {
      <div class="text-center py-24 text-gray-500">Event not found</div>
    }
  `,
  styles: [`
    path[data-tooltip] { position: relative; }
    .cursor-move { cursor: move; }
  `]
})
export class EventDetailComponent implements OnInit {
  event = signal<Event | null>(null);
  isLoading = signal<boolean>(true);
  currentLang = signal<string>('es');

  // Cart State
  cart = signal<{ ticketId: number; name: string; price: number; quantity: number }[]>([]);

  // Checkout State
  isCheckoutModalOpen = signal(false);
  guestForm = { name: '', email: '' };
  isProcessing = signal(false);

  // Map Zoom/Pan State
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  isDragging = false;
  lastMouseX = 0;
  lastMouseY = 0;
  mapViewBox = signal('0 0 500 500');

  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  onImageLoad(event: any) {
    const img = event.target as HTMLImageElement;
    // Set viewBox matches natural dimensions
    this.mapViewBox.set(`0 0 ${img.naturalWidth} ${img.naturalHeight}`);
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1950&q=80';
  }

  // Computed
  activeTier = computed(() => {
    const event = this.event();
    if (!event?.tiers || event.tiers.length === 0) return null;
    const now = new Date();
    return event.tiers.find(t => new Date(t.startDate) <= now && new Date(t.endDate) >= now) || null;
  });

  displayedTickets = computed(() => {
    const event = this.event();
    if (!event?.Tickets) return [];

    // If tiers exist, strictly filter by active tier
    if (event.tiers && event.tiers.length > 0) {
      const tier = this.activeTier();
      if (tier) {
        return event.Tickets.filter(t => t.tierId === tier.id);
      } else {
        // No active tier? Maybe show nothing or "Coming Soon"
        // For now, return empty to prevent mixing
        return [];
      }
    }

    // No tiers, show all (legacy/standard)
    return event.Tickets;
  });

  cartTotal = computed(() => this.cart().reduce((sum, item) => sum + (item.price * item.quantity), 0));
  cartCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  totalItems = this.cartCount;
  totalPrice = this.cartTotal;
  cartItems = this.cart;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private orderService: OrderService,
    public authService: AuthService,
    private translate: TranslateService
  ) {
    this.currentLang.set(this.translate.currentLang || 'es');
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang.set(event.lang);
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(+id);
    }
  }

  loadEvent(id: number) {
    this.isLoading.set(true);
    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // --- Map Logic ---

  hasVisualSections(): boolean {
    return this.event()?.VenueLayout?.sections?.some(s => !!s.visualData) ?? false;
  }

  getSectionClass(section: VenueSection): string {
    const ticket = this.getTicketForSection(section.id);
    const inCart = ticket && this.getQty(ticket.id) > 0;
    if (inCart) return 'fill-pink-600 hover:fill-pink-700 cursor-pointer opacity-60';

    if (!ticket || ticket.available === 0) {
      return 'fill-gray-300 cursor-not-allowed opacity-60';
    }
    return 'fill-green-500 hover:fill-green-600 cursor-pointer opacity-60';
  }

  getSectionTooltip(section: VenueSection): string | null {
    const ticket = this.getTicketForSection(section.id);
    if (!ticket || ticket.available === 0) {
      return null;
    }
    return `${section.name} - ${ticket.price} ${this.event()?.currency || 'USD'} (${ticket.available} left)`;
  }

  onSectionClick(section: VenueSection) {
    if (this.isDragging) return; // Prevent click during drag

    const ticket = this.getTicketForSection(section.id);
    if (!ticket || ticket.available === 0) return;

    if (this.getQty(ticket.id) === 0) {
      this.increaseQty(ticket.id, ticket.available);
    } else {
      this.increaseQty(ticket.id, ticket.available);
    }
  }

  // Zoom / Pan Implementation
  isPanning = false;

  startPan(event: MouseEvent) {
    this.isPanning = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    // Don't prevent default immediately to allow click events to propagate if no drag occurs
    // event.preventDefault(); 
  }

  pan(event: MouseEvent) {
    if (!this.isPanning) return;

    if (!this.isDragging) {
      const dist = Math.hypot(event.clientX - this.lastMouseX, event.clientY - this.lastMouseY);
      if (dist > 3) {
        this.isDragging = true;
      }
    }

    if (this.isDragging) {
      const dx = event.clientX - this.lastMouseX;
      const dy = event.clientY - this.lastMouseY;
      this.panX += dx;
      this.panY += dy;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  endPan() {
    this.isPanning = false;
    if (this.isDragging) {
      // If it was a drag, delay resetting to block the subsequent click
      setTimeout(() => this.isDragging = false, 50);
    }
    // If it wasn't a drag, isDragging is already false, allowing the click to pass
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    this.applyZoom(zoomDelta);
  }

  applyZoom(factor: number) {
    const newZoom = this.zoomLevel * factor;
    if (newZoom >= 1 && newZoom < 5) {
      this.zoomLevel = newZoom;
    }
  }

  zoomIn() { this.applyZoom(1.2); }
  zoomOut() { this.applyZoom(0.8); }
  resetView() {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
  }


  getTicketForSection(sectionId?: number): Ticket | undefined {
    if (!sectionId) return undefined;
    // Prefer displayed tickets (active phase), falling back to any if needed?
    // Actually, only allow selection of tickets active in the current phase
    return this.displayedTickets().find(t => t.sectionId == sectionId);
  }

  isSectionSelected(sectionId?: number): boolean {
    const ticket = this.getTicketForSection(sectionId);
    return ticket ? this.getQty(ticket.id) > 0 : false;
  }

  getSectionName(sectionId?: number): string {
    return this.event()?.VenueLayout?.sections?.find(s => s.id === sectionId)?.name || '';
  }

  // --- Cart ---

  getQty(ticketId: number): number {
    return this.cart().find(i => i.ticketId === ticketId)?.quantity || 0;
  }

  getTicketName(ticketId: number): string {
    return this.cart().find(i => i.ticketId === ticketId)?.name || '';
  }

  getTicketPrice(ticketId: number): number {
    return this.cart().find(i => i.ticketId === ticketId)?.price || 0;
  }

  increaseQty(ticketId: number, max: number) {
    // Search in all tickets? Or displayed?
    // It should be fine to search in all, but only displayed tickets call this method
    const ticket = this.event()?.Tickets?.find(t => t.id === ticketId);
    if (!ticket) return;

    this.cart.update(items => {
      const existing = items.find(i => i.ticketId === ticketId);
      if (existing) {
        if (existing.quantity < max) {
          return items.map(i => i.ticketId === ticketId ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return items;
      } else {
        return [...items, { ticketId, name: ticket.name, price: ticket.price, quantity: 1 }];
      }
    });
  }

  decreaseQty(ticketId: number) {
    this.cart.update(items => {
      const existing = items.find(i => i.ticketId === ticketId);
      if (existing) {
        if (existing.quantity > 1) {
          return items.map(i => i.ticketId === ticketId ? { ...i, quantity: i.quantity - 1 } : i);
        } else {
          return items.filter(i => i.ticketId !== ticketId);
        }
      }
      return items;
    });
  }

  removeItem(ticketId: number) {
    this.cart.update(items => items.filter(i => i.ticketId !== ticketId));
  }

  getMinPrice(event: Event): number {
    if (!event.Tickets || event.Tickets.length === 0) return 0;
    return Math.min(...event.Tickets.map(t => t.price));
  }

  startCheckout() {
    if (this.cartCount() === 0) return;
    this.orderService.setCart(this.cart(), this.event()?.currency || 'USD');
    this.router.navigate(['/checkout']);
  }
}

