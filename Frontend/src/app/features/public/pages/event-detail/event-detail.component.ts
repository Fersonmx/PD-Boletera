import { Component, OnInit, signal, computed, ElementRef, ViewChild } from '@angular/core';
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
      <div class="bg-white min-h-screen pb-28 lg:pb-12">
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
                    <div class="relative w-full h-[350px] sm:h-[450px] md:h-[550px] bg-gray-50 overflow-hidden cursor-move border-b border-gray-200"
                         (mousedown)="startPan($event)"
                         (mousemove)="pan($event)"
                         (mouseup)="endPan()"
                         (mouseleave)="endPan()"
                         (touchstart)="startPanTouch($event)"
                         (touchmove)="panTouch($event)"
                         (touchend)="endPan()"
                         (wheel)="onWheel($event)"
                         (contextmenu)="$event.preventDefault()">
                         
                        <!-- Controls -->
                         <div class="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-100">
                            <button (click)="zoomIn()" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 transition-colors" title="Zoom In"><i class="fas fa-plus"></i></button>
                            <button (click)="zoomOut()" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 transition-colors" title="Zoom Out"><i class="fas fa-minus"></i></button>
                            <button (click)="resetView()" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 transition-colors" title="Reset"><i class="fas fa-compress"></i></button>
                         </div>
                    
                        <!-- Scrollable Layout -->
                        <div [style.transform]="'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')'" 
                             class="w-full h-full origin-center transition-transform duration-75 will-change-transform flex items-center justify-center p-2 sm:p-4">
                             
                             <div class="relative w-full max-w-5xl flex items-center justify-center"> 
                                 <!-- Hidden Image just to calculate natural dimensions for viewBox -->
                                 @if (event()?.VenueLayout?.imageUrl) {
                                    <img [src]="event()?.VenueLayout?.imageUrl" 
                                         (load)="onImageLoad($event)"
                                         (error)="onImageError($event)"
                                         class="hidden"> 
                                 }
                                
                                <svg #mapSvg [attr.viewBox]="mapViewBox()" preserveAspectRatio="xMidYMid meet" class="w-full h-auto drop-shadow-md z-10 transition-all duration-300 overflow-visible">
                                     <!-- Render image natively inside the SVG to enforce an unbreakable 1:1 scale lock -->
                                     @if (mapViewBox() !== '0 0 500 500' && event()?.VenueLayout?.imageUrl) {
                                         <image [attr.href]="event()?.VenueLayout?.imageUrl" [attr.width]="imageWidth()" [attr.height]="imageHeight()" preserveAspectRatio="xMidYMid meet" />
                                     }
                                     @for (section of event()?.VenueLayout?.sections; track section.id) {
                                        @if (section.visualData) {
                                            <path [attr.d]="section.visualData" 
                                                  (click)="onSectionClick(section)"
                                                  (mouseenter)="hoveredSection.set(section)"
                                                  (mouseleave)="hoveredSection.set(null)"
                                                  (touchstart)="hoveredSection.set(section)"
                                                  [class]="getSectionClass(section)"
                                                  class="transition-all duration-300 stroke-white stroke-[3px] pointer-events-auto">
                                            </path>
                                        }
                                     }
                                </svg>
                             </div>
                        </div>

                        <!-- Elegant Fixed Tooltip -->
                        @if (hoveredSection() && getTicketForSection(hoveredSection()!.id)) {
                           <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 px-6 py-3 bg-gray-900/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-white/10 flex items-center gap-5 animate-fadeIn pointer-events-none transition-all duration-200 min-w-max">
                               <div>
                                   <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{{ hoveredSection()?.name }}</p>
                                   <p class="text-lg font-black text-pink-400 leading-none">{{ getTicketForSection(hoveredSection()!.id)?.price | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</p>
                               </div>
                               <div class="w-px h-8 bg-white/20"></div>
                               <div class="text-right">
                                   <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold hidden sm:block mb-0.5">{{ 'EVENT_DETAIL.AVAILABLE' | translate }}</p>
                                   <p class="text-sm font-bold text-green-400 leading-none mt-1 sm:mt-0">{{ getTicketForSection(hoveredSection()!.id)?.available }} <i class="fas fa-ticket-alt ml-1 opacity-70 text-xs"></i></p>
                               </div>
                           </div>
                        }

                    </div>
                     <p class="text-center text-xs text-gray-400 p-3 bg-gray-50 border-t border-gray-100 font-medium tracking-wide">
                        <i class="fas fa-hand-pointer mr-1 text-pink-400"></i> {{ 'EVENT_DETAIL.MAP_INSTRUCTIONS' | translate }}
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
              <div class="bg-white lg:bg-gray-50 rounded-t-3xl lg:rounded-xl p-6 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] lg:shadow-sm border-t lg:border border-gray-200 transition-all duration-300 z-50"
                   [ngClass]="{
                     'fixed bottom-0 left-0 w-full': totalItems() > 0,
                     'sticky top-24 relative lg:static': totalItems() === 0,
                     'lg:relative lg:sticky lg:top-24 lg:w-auto lg:shadow-sm lg:rounded-xl lg:border-t-0': totalItems() > 0
                   }">
                  
                  <div class="flex justify-between items-center lg:items-start lg:block cursor-pointer lg:cursor-default" (click)="isMobileCartOpen.set(!isMobileCartOpen())">
                      <h3 class="text-lg font-bold text-gray-900 mb-0 lg:mb-4 flex items-center gap-2">
                          {{ 'EVENT_DETAIL.SUMMARY' | translate }}
                          @if (totalItems() > 0) {
                              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-600 text-white text-xs lg:hidden shadow-sm">{{ totalItems() }}</span>
                          }
                      </h3>
                      @if (totalItems() > 0) {
                          <div class="lg:hidden flex items-center gap-4">
                              <span class="font-black text-xl text-pink-600">{{ totalPrice() | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</span>
                              <button (click)="startCheckout(); $event.stopPropagation()" class="px-6 py-2 bg-pink-600 text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform uppercase tracking-widest text-[10px] sm:text-xs">
                                  {{ isProcessing() ? ('EVENT_DETAIL.CHECKOUT_PROCESSING' | translate) : ('EVENT_DETAIL.CHECKOUT' | translate) }}
                              </button>
                              <i class="fas fa-chevron-up text-gray-400 text-sm transform transition-transform" [class.rotate-180]="isMobileCartOpen()"></i>
                          </div>
                      }
                  </div>
                  
                  <div [class.hidden]="totalItems() > 0 && !isMobileCartOpen()" class="lg:block mt-6 lg:mt-0">
                      @if (totalItems() > 0) {
                         <div class="max-h-48 overflow-y-auto lg:max-h-none space-y-3 mb-6 border-b border-gray-100 pb-4 no-scrollbar">
                            @for (item of cartItems(); track item.ticketId) {
                                @if (item.quantity > 0) {
                                    <div class="flex justify-between items-center text-sm group bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                        <div>
                                            <span class="block font-bold text-gray-900 leading-tight">{{ getTicketName(item.ticketId) }}</span>
                                            <div class="flex items-center gap-3 mt-1.5">
                                                <span class="text-xs text-gray-500 font-medium">{{ 'EVENT_DETAIL.QTY' | translate }}: <span class="text-gray-900">{{item.quantity}}</span></span>
                                                <button (click)="removeItem(item.ticketId)" class="text-[10px] text-pink-500 hover:text-pink-700 font-bold uppercase tracking-wider flex items-center gap-1"><i class="fas fa-times"></i> {{ 'EVENT_DETAIL.REMOVE' | translate }}</button>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <span class="font-black text-gray-900 text-base">{{ getTicketPrice(item.ticketId) * item.quantity | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</span>
                                        </div>
                                    </div>
                                }
                            }
                         </div>
                         
                         <div class="hidden lg:flex justify-between items-center text-xl font-black text-gray-900 mb-6">
                            <span class="uppercase tracking-tight">{{ 'EVENT_DETAIL.TOTAL' | translate }}</span>
                            <span class="text-2xl text-pink-600">{{ totalPrice() | currency:(event()?.currency || 'USD'):'symbol':'1.0-0':currentLang() }}</span>
                         </div>
            
                         <button (click)="startCheckout()" [disabled]="isProcessing()" class="hidden lg:block w-full py-4 bg-pink-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-pink-200 transform hover:-translate-y-1 active:translate-y-0 text-lg">
                            {{ isProcessing() ? ('EVENT_DETAIL.CHECKOUT_PROCESSING' | translate) : ('EVENT_DETAIL.CHECKOUT' | translate) }}
                         </button>
                      } @else {
                          <div class="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                               <div class="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                   <i class="fas fa-ticket-alt text-2xl text-gray-300"></i>
                               </div>
                               <p class="text-gray-500 text-sm font-medium">{{ 'EVENT_DETAIL.SELECT_TO_PROCEED' | translate }}</p>
                          </div>
                          <button disabled class="w-full mt-6 py-4 bg-gray-100 text-gray-400 rounded-xl font-black uppercase tracking-wider cursor-not-allowed hidden lg:block">
                            {{ 'EVENT_DETAIL.CHECKOUT' | translate }}
                          </button>
                      }
                      
                      <div class="mt-6 pt-4 border-t border-gray-100">
                         <div class="flex items-center gap-3 justify-center text-gray-300 mb-3 grayscale opacity-70">
                            <i class="fab fa-cc-visa text-3xl hover:grayscale-0 hover:text-blue-600 transition-all"></i>
                            <i class="fab fa-cc-mastercard text-3xl hover:grayscale-0 hover:text-orange-500 transition-all"></i>
                            <i class="fab fa-cc-amex text-3xl hover:grayscale-0 hover:text-blue-500 transition-all"></i>
                         </div>
                         <p class="text-[10px] text-gray-400 text-center font-medium uppercase tracking-widest leading-relaxed hidden lg:block">
                           {{ 'EVENT_DETAIL.SECURE_CHECKOUT' | translate }} <br>
                           {{ 'EVENT_DETAIL.BUYER_GUARANTEE' | translate }}
                         </p>
                      </div>
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
    .cursor-move { cursor: move; touch-action: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class EventDetailComponent implements OnInit {
  event = signal<Event | null>(null);
  isLoading = signal<boolean>(true);
  currentLang = signal<string>('es');

  // Hover Tooltip
  hoveredSection = signal<VenueSection | null>(null);

  // Cart State
  cart = signal<{ ticketId: number; name: string; price: number; quantity: number }[]>([]);

  // Checkout State
  isCheckoutModalOpen = signal(false);
  guestForm = { name: '', email: '' };
  isProcessing = signal(false);

  // Mobile Floating Cart State
  isMobileCartOpen = signal(false);

  // Map Zoom/Pan State
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  isDragging = false;
  lastMouseX = 0;
  lastMouseY = 0;
  mapViewBox = signal('0 0 500 500');
  mapAspectRatio = signal('1 / 1'); // Keep aspect ratio synced
  imageWidth = signal(500);
  imageHeight = signal(500);

  @ViewChild('mapSvg') mapSvgElement!: ElementRef<SVGElement>;

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

  onImageLoad(event: any) {
    const img = event.target as HTMLImageElement;
    // Set viewBox matches natural dimensions
    let w = img.naturalWidth || 800;
    let h = img.naturalHeight || 600;

    this.imageWidth.set(w);
    this.imageHeight.set(h);
    this.mapViewBox.set(`0 0 ${w} ${h}`);
    this.mapAspectRatio.set(`${w} / ${h}`);

    // Wait for angular to render paths, then recalculate to include them
    setTimeout(() => this.recalculateBoundingBox(w, h), 100);
  }

  recalculateBoundingBox(imgW: number, imgH: number) {
    try {
      if (!this.mapSvgElement) return;
      const svg = this.mapSvgElement.nativeElement as any;
      if (typeof svg.getBBox === 'function') {
        const bbox = svg.getBBox();
        if (bbox && bbox.width > 0) {
          // Merge Image dimensions and Bounding Box of all paths
          const minX = Math.min(0, bbox.x);
          const minY = Math.min(0, bbox.y);
          const maxX = Math.max(imgW, bbox.x + bbox.width);
          const maxY = Math.max(imgH, bbox.y + bbox.height);

          const width = maxX - minX;
          const height = maxY - minY;

          if (width > 0 && height > 0) {
            // Apply padding so edges don't get strictly cut off
            const pad = Math.max(width, height) * 0.05;
            this.mapViewBox.set(`${minX - pad} ${minY - pad} ${width + pad * 2} ${height + pad * 2}`);
          }
        }
      }
    } catch (e) {
      console.warn('Could not calculate exact SVG Bounding box', e);
    }
  }

  onImageError(event: any) {
    // If image fails, fallback to rendering just the sections bounds
    setTimeout(() => this.recalculateBoundingBox(800, 600), 100);
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
    if (inCart) return 'fill-pink-500 opacity-90 stroke-[3px] stroke-pink-700 drop-shadow-md';

    if (!ticket || ticket.available === 0) {
      return 'fill-gray-300 cursor-not-allowed opacity-50 relative';
    }
    return 'fill-green-500 hover:fill-green-400 cursor-pointer opacity-70 relative';
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
      setTimeout(() => this.isDragging = false, 50);
    }
  }

  // --- Touch Support for Mobile Dragging ---
  lastTouchDistance = 0;
  lastTouchMidX = 0;
  lastTouchMidY = 0;

  startPanTouch(event: TouchEvent) {
    if (event.touches.length === 2) {
      if (event.cancelable) event.preventDefault();

      this.isPanning = true;
      const t1 = event.touches[0];
      const t2 = event.touches[1];

      this.lastTouchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      this.lastTouchMidX = (t1.clientX + t2.clientX) / 2;
      this.lastTouchMidY = (t1.clientY + t2.clientY) / 2;
    }
  }

  panTouch(event: TouchEvent) {
    if (event.touches.length === 2 && this.isPanning) {
      if (event.cancelable) event.preventDefault();

      const t1 = event.touches[0];
      const t2 = event.touches[1];

      const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;

      const dx = currentMidX - this.lastTouchMidX;
      const dy = currentMidY - this.lastTouchMidY;

      if (!this.isDragging && (Math.hypot(dx, dy) > 3 || Math.abs(currentDistance - this.lastTouchDistance) > 5)) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        this.panX += dx;
        this.panY += dy;

        if (this.lastTouchDistance > 0 && Math.abs(currentDistance - this.lastTouchDistance) > 2) {
          const zoomFactor = currentDistance / this.lastTouchDistance;
          this.applyZoom(zoomFactor);
        }

        this.lastTouchDistance = currentDistance;
        this.lastTouchMidX = currentMidX;
        this.lastTouchMidY = currentMidY;
      }
    }
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

