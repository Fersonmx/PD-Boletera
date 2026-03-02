import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ContentService } from '../../../../core/services/content.service';
import { EventService, Event } from '../../../../core/services/event.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-white text-gray-900 font-sans selection:bg-pink-500 selection:text-white pb-20">
      
      <!-- Dynamic Hero Section -->
      <div class="relative bg-black h-[600px] flex items-center overflow-hidden mb-10">
          
          <!-- Background Image (Dynamic) -->
          <div class="absolute inset-0 z-0">
             @if(activeSlide()) {
                 <img [src]="getImageUrl(activeSlide()?.imageUrl || activeSlide()?.event?.imageUrl) || 'assets/hero-bg-2.jpg'" 
                      class="w-full h-full object-cover opacity-60 transition-opacity duration-1000 animate-fadeIn">
                 <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
             } @else {
                 <!-- Fallback -->
                 <img src="assets/hero-bg-2.jpg" class="w-full h-full object-cover opacity-60">
                 <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
             }
          </div>

          <!-- Hero Content -->
          <div class="container mx-auto px-4 relative z-10 pt-20">
            <div class="max-w-4xl animate-fadeIn">
              @if(activeSlide()) {
                  @if(activeSlide().type === 'branding') {
                       <span class="inline-block py-1 px-3 rounded-full bg-primary/90 text-white text-xs font-bold tracking-wider mb-4 uppercase backdrop-blur-sm">
                        {{ activeSlide().subtitle }}
                      </span>
                      <h1 class="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                        {{ activeSlide().title }}
                      </h1>
                      <p class="text-white text-xl mb-8 font-light italic">{{ activeSlide().description }}</p>
                      
                      <div class="flex gap-4">
                         <a routerLink="/events" class="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-secondary hover:text-black transition-all shadow-lg hover:shadow-primary/20">
                           {{ 'HOME.HERO.CTA' | translate }}
                         </a>
                      </div>
                  } @else {
                      <span class="inline-block py-1 px-3 rounded-full bg-primary/90 text-white text-xs font-bold tracking-wider mb-4 uppercase backdrop-blur-sm">
                        {{ activeSlide()?.subtitle || (activeSlide()?.event?.date | date:'fullDate') }}
                      </span>
                      <h1 class="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                        {{ activeSlide()?.title || activeSlide()?.event?.title }}
                      </h1>
                      
                      <div class="flex flex-wrap gap-4">
                        @if(activeSlide()?.event?.id) {
                            <a [routerLink]="['/events', activeSlide()?.event?.id]" class="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-secondary hover:text-black transition-all shadow-lg hover:shadow-primary/20">
                              {{ 'HOME.HERO.CTA' | translate }}
                            </a>
                        }
                      </div>
                  }

                  <!-- Slider Controls (Arrows & Indicators) -->
                  @if(slides().length > 1) {
                      <div class="absolute bottom-10 left-0 w-full flex items-center justify-between pointer-events-none">
                           <!-- Dots -->
                           <div class="flex gap-2 pointer-events-auto">
                              @for(slide of slides(); track slide.id; let i = $index) {
                                  <button (click)="setActiveSlide(i)" 
                                          [class]="currentSlideIndex() === i ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white'"
                                          class="h-1 rounded-full transition-all duration-300">
                                  </button>
                              }
                           </div>

                           <!-- Arrows (Right aligned relative to content container, but absolute in context) -->
                           <div class="flex gap-3 pointer-events-auto">
                               <button (click)="prevSlide()" class="w-10 h-10 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                   <i class="fas fa-chevron-left"></i>
                               </button>
                               <button (click)="nextSlide()" class="w-10 h-10 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                   <i class="fas fa-chevron-right"></i>
                               </button>
                           </div>
                      </div>
                  }
              } @else {
                   <!-- Fallback Content -->
                   <h1 class="text-5xl md:text-7xl font-black text-white mb-6">WOWticket<br><span class="text-primary text-3xl block mt-4 font-bold">Una boletera digital centrada en la experiencia, no solo en la transacción.</span></h1>
                   <p class="text-white text-xl mb-8 font-light italic">Vendemos acceso. Creamos conexión.</p>
                   <div class="flex gap-4">
                      <a routerLink="/events" class="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-secondary hover:text-black transition-all">Browse Events</a>
                   </div>
              }
            </div>
          </div>
      </div>

      <!-- Filters (Tabs) -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 border-b border-gray-200">
        <div class="flex space-x-6 overflow-x-auto pb-3 no-scrollbar">
          @for (filter of filters; track filter) {
            <button 
              (click)="activeFilter.set(filter)"
              class="whitespace-nowrap transition-colors duration-200"
              [class]="activeFilter() === filter 
                ? 'px-5 py-2 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-black transition shadow-lg' 
                : 'px-5 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-primary transition shadow-sm'">
              {{ filter | translate }}
            </button>
          }
        </div>
      </div>

      <!-- Events Grid -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
          </div>
        }

        @if (!isLoading() && filteredEvents().length === 0) {
           <div class="text-center py-20">
             <h3 class="text-xl font-bold text-gray-900">{{ 'HOME.NO_EVENTS' | translate }}</h3>
           </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
          @for (event of filteredEvents(); track event.id) {
            <div class="group flex flex-col h-full bg-white rounded-lg transition-transform duration-300 md:hover:-translate-y-1">
              <!-- Image Card -->
              <div class="relative aspect-[3/2] bg-gray-100 mb-4 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md">
                 <img [src]="getImageUrl(event.imageUrl) || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80'" 
                      alt="{{ event.title }}" 
                      class="object-cover w-full h-full grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-all duration-500 transform md:group-hover:scale-105">
                 
                 <!-- Date Badge Overlay -->
                 <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md text-center shadow-sm">
                    <span class="block text-xs font-bold uppercase tracking-wider text-gray-500 leading-none">
                      {{ event.date | date:'MMM' }}
                    </span>
                    <span class="block text-xl font-black leading-none mt-1">
                      {{ event.date | date:'d' }}
                    </span>
                 </div>
              </div>

              <!-- Info -->
              <div class="flex flex-col flex-1 px-1">
                 <h3 class="text-lg font-black leading-tight mb-2 uppercase tracking-tight text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                   {{ event.title }}
                 </h3>
                 
                 <div class="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
                    <div class="flex flex-col w-full">
                      <span class="text-xs font-bold uppercase tracking-wide text-gray-500">
                        {{ event.Venue?.city }}
                      </span>
                      <span class="text-[10px] text-gray-400 font-medium truncate w-full">
                        {{ event.Venue?.name }}
                      </span>
                    </div>

                     <a [routerLink]="['/events', event.id]" 
                        class="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-secondary hover:text-black transition-all shadow-md hover:shadow-primary/20 w-full">
                        {{ 'HOME.FIND_TICKETS' | translate }}
                    </a>
                 </div>
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Newsletter -->
       <div class="w-full mt-24">
          <div class="relative bg-black h-[500px] flex items-center overflow-hidden">
             <!-- Background Image -->
             <div class="absolute inset-0 z-0">
                <img src="assets/newsletter-bg.png" class="w-full h-full object-cover opacity-90">
                <!-- Overlay gradient to ensure text readability -->
                <div class="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent"></div>
             </div>

             <div class="container mx-auto px-4 relative z-10">
                <div class="max-w-2xl">
                   <h2 class="text-4xl md:text-6xl font-black uppercase leading-none mb-6 tracking-tight text-white drop-shadow-md">
                     {{ 'HOME.NEWSLETTER_TITLE' | translate }}
                   </h2>
                   <p class="text-xl text-white mb-8 max-w-lg font-medium drop-shadow-sm">
                     {{ 'HOME.NEWSLETTER_DESC' | translate }}
                   </p>
                   
                   <div class="flex flex-col sm:flex-row gap-4 max-w-lg bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                      <input type="email" [placeholder]="'HOME.EMAIL_PLACEHOLDER' | translate" 
                             class="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder:text-white/70 font-bold focus:outline-none focus:ring-0 text-lg">
                      <button class="px-8 py-3 bg-secondary text-black font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-primary transition-all shadow-lg whitespace-nowrap">
                        {{ 'HOME.SUBSCRIBE' | translate }}
                      </button>
                   </div>
                   <p class="mt-4 text-xs text-white/70 font-medium">
                     By subscribing you agree to our Terms & Privacy Policy.
                   </p>
                </div>
             </div>
          </div>
       </div>

    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  events = signal<Event[]>([]);
  isLoading = signal<boolean>(true);

  // Search
  searchQuery = signal<string>('');

  // Hero Slider
  slides = signal<any[]>([]);
  activeSlide = signal<any>(null);
  currentSlideIndex = signal(0);
  intervalId: any;

  // Mock Data for Hero Slider - REPLACED with filtered events
  featuredEvents = signal<Event[]>([]);
  currentFeaturedIndex = signal(0);
  sliderInterval: any;

  // Update filters to use translation keys
  filters = ['HOME.FILTERS.ALL', 'HOME.FILTERS.TODAY', 'HOME.FILTERS.THIS_WEEKEND', 'HOME.FILTERS.THIS_MONTH', 'HOME.FILTERS.FESTIVAL'];
  activeFilter = signal('HOME.FILTERS.ALL');

  filteredEvents = computed(() => {
    const allEvents = this.events();
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    // 1. Base Filter: Published & Not Expired (Future or Today)
    let filtered = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      // Reset time to ensure we include events happening today even if hours passed? 
      // Actually usually event date has time. If event is today at 8PM and now is 9PM, is it expiried?
      // User says "expirados", usually means days before today. 
      // Let's assume if date (YYYY-MM-DD) < today (YYYY-MM-DD) it is expired.
      const eventDateOnly = new Date(eventDate);
      eventDateOnly.setHours(0, 0, 0, 0);

      return event.status === 'published' && eventDateOnly.getTime() >= now.getTime();
    });

    // 2. Apply Active Tab Filter
    const filter = this.activeFilter();

    switch (filter) {
      case 'HOME.FILTERS.TODAY':
        filtered = filtered.filter(e => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === now.getTime();
        });
        break;

      case 'HOME.FILTERS.THIS_WEEKEND':
        // Calculate Weekend (Friday - Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

        // Calculate next Friday
        const diffToFriday = (5 - dayOfWeek + 7) % 7 || 7; // If today is Friday (5), next friday is today? No, "This Weekend". 
        // If today is Friday, it's part of this weekend.
        // Let's simpler logic: "This Weekend" usually means the upcoming Friday-Sunday block.
        // If today is Sunday, "This Weekend" is today.

        const friday = new Date(today);
        friday.setDate(today.getDate() + (dayOfWeek === 5 ? 0 : (5 - dayOfWeek + 7) % 7));
        // If today is Saturday (6), (5 - 6 + 7) % 7 = 6 % 7 = 6. Friday is +6 days away? No.
        // If Sat, Friday was yesterday. Usually "This Weekend" includes remaining days.

        // Let's just grab events in the current week's Fri/Sat/Sun.
        const currentData = new Date();
        const friday2 = new Date();
        const sunday2 = new Date();

        // Logic: Find the Friday of the current week.
        // We generally treat "This Weekend" as: Friday, Saturday, Sunday of the *current* week.
        const day = currentData.getDay();
        const distToFriday = 5 - day; // If Fri (5), 0. If Sat (6), -1. If Sun (0), 5 (should be -2?).

        // Let's stick to simple: Range from *Now* until next Sunday end.
        const nextSunday = new Date();
        nextSunday.setDate(currentData.getDate() + (7 - currentData.getDay()) % 7);
        nextSunday.setHours(23, 59, 59, 999);

        // Only show if it falls on Fri, Sat, Sun
        filtered = filtered.filter(e => {
          const d = new Date(e.date);
          const day = d.getDay();
          return d <= nextSunday && (day === 5 || day === 6 || day === 0);
        });
        break;

      case 'HOME.FILTERS.THIS_MONTH':
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        filtered = filtered.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        break;

      case 'HOME.FILTERS.FESTIVAL':
        filtered = filtered.filter(e => e.Category?.slug?.toLowerCase().includes('festival'));
        break;

      case 'HOME.FILTERS.ALL':
      default:
        // No extra filtering
        break;
    }

    return filtered;
  });

  constructor(
    private eventService: EventService,
    private contentService: ContentService,
    private router: Router
  ) { }

  ngOnInit() {
    // 1. Load Hero Slides (Custom)
    this.contentService.getHeroSlides().subscribe(slides => {
      if (slides && slides.length > 0) {
        this.slides.set(slides);
        this.activeSlide.set(slides[0]);
        this.startSlider();
      }
    });

    // 2. Load Regular Events
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events.set(data.events);
        this.isLoading.set(false);

        // Fallback: If no custom slides, use featured logic?
        // For now, keeping separate: Slides are Hero. Featured are below (if we kept that section).
        // Actually, the previous code replaced "Featured Slider" with "Hero".
        // If no custom slides, we can fallback to featured events in the hero if desired.
        // Logic:
        if (this.slides().length === 0) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const published = data.events.filter(e => e.status === 'published' && new Date(e.date) >= now);
          if (published.length > 0) {
            // Convert top events to "Slide" format
            const fakeSlides = published.slice(0, 5).map(e => ({
              id: e.id,
              title: e.title,
              subtitle: new Date(e.date).toLocaleDateString(),
              imageUrl: e.imageUrl,
              event: e
            }));

            const brandingSlide = {
              id: 'branding',
              type: 'branding',
              title: 'WOWticket',
              subtitle: 'Una boletera digital centrada en la experiencia',
              description: 'Vendemos acceso. Creamos conexión.',
              imageUrl: 'assets/hero-bg-2.jpg'
            };
            const allSlides = [brandingSlide, ...fakeSlides];

            this.slides.set(allSlides);
            this.activeSlide.set(allSlides[0]);
            this.startSlider();
          }
        }
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startSlider() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    if (this.slides().length === 0) return;
    const nextIndex = (this.currentSlideIndex() + 1) % this.slides().length;
    this.setActiveSlide(nextIndex);
  }

  prevSlide() {
    if (this.slides().length === 0) return;
    const prevIndex = (this.currentSlideIndex() - 1 + this.slides().length) % this.slides().length;
    this.setActiveSlide(prevIndex);
  }

  setActiveSlide(index: number) {
    this.currentSlideIndex.set(index);
    this.activeSlide.set(this.slides()[index]);
    this.startSlider(); // reset timer
  }

  nextFeatured() {
    this.currentFeaturedIndex.update(i => (i + 1) % this.featuredEvents().length);
  }

  prevFeatured() {
    this.currentFeaturedIndex.update(i => (i - 1 + this.featuredEvents().length) % this.featuredEvents().length);
  }

  setFeaturedIndex(index: number) {
    this.currentFeaturedIndex.set(index);
    // Reset timer
    clearInterval(this.sliderInterval);
    this.startSlider();
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

  onSearch() {
    if (this.searchQuery().trim()) {
      this.router.navigate(['/events'], { queryParams: { search: this.searchQuery() } });
    }
  }
}
