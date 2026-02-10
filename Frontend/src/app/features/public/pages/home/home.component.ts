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
                  <span class="inline-block py-1 px-3 rounded-full bg-pink-600/90 text-white text-xs font-bold tracking-wider mb-4 uppercase backdrop-blur-sm">
                    {{ activeSlide()?.subtitle || (activeSlide()?.event?.date | date:'fullDate') }}
                  </span>
                  <h1 class="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                    {{ activeSlide()?.title || activeSlide()?.event?.title }}
                  </h1>
                  
                  <div class="flex flex-wrap gap-4">
                    @if(activeSlide()?.event?.id) {
                        <a [routerLink]="['/events', activeSlide()?.event?.id]" class="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition transform hover:-translate-y-1 shadow-lg shadow-white/10 text-lg">
                          {{ 'HOME.HERO.CTA' | translate }}
                        </a>
                    }
                  </div>

                  <!-- Slider Controls -->
                  @if(slides().length > 1) {
                      <div class="flex gap-2 mt-12">
                          @for(slide of slides(); track slide.id; let i = $index) {
                              <button (click)="setActiveSlide(i)" 
                                      [class]="currentSlideIndex() === i ? 'w-8 bg-pink-500' : 'w-2 bg-gray-500 hover:bg-gray-400'"
                                      class="h-1 rounded-full transition-all duration-300">
                              </button>
                          }
                      </div>
                  }
              } @else {
                   <!-- Fallback Content -->
                   <h1 class="text-5xl md:text-7xl font-black text-white mb-6">Welcome to<br><span class="text-pink-500">PD_Boletera</span></h1>
                   <div class="flex gap-4">
                      <a routerLink="/events" class="px-8 py-4 bg-pink-600 text-white rounded-full font-bold">Browse Events</a>
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
              class="whitespace-nowrap text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors duration-200"
              [ngClass]="activeFilter() === filter ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'">
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
            <div class="group flex flex-col h-full bg-white rounded-lg transition-transform duration-300 hover:-translate-y-1">
              <!-- Image Card -->
              <div class="relative aspect-[3/2] bg-gray-100 mb-4 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md">
                 <img [src]="getImageUrl(event.imageUrl) || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80'" 
                      alt="{{ event.title }}" 
                      class="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105">
                 
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
                 
                 <div class="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold uppercase tracking-wide text-gray-500">
                        {{ event.Venue?.city }}
                      </span>
                      <span class="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
                        {{ event.Venue?.name }}
                      </span>
                    </div>

                     <a [routerLink]="['/events', event.id]" 
                        class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-pink-600 hover:text-pink-800 transition-colors whitespace-nowrap">
                        {{ 'HOME.FIND_TICKETS' | translate }}
                        <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                    </a>
                 </div>
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Newsletter -->
       <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-20">
          <div class="bg-black text-white rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-2xl">
             <!-- Decorative Gradients -->
             <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-pink-600 rounded-full blur-3xl opacity-30"></div>
             <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-30"></div>

             <div class="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                   <h2 class="text-3xl md:text-5xl font-black uppercase leading-none mb-6 tracking-tight">{{ 'HOME.NEWSLETTER_TITLE' | translate }}</h2>
                   <p class="text-lg text-gray-400 mb-8 max-w-md font-light">{{ 'HOME.NEWSLETTER_DESC' | translate }}</p>
                   
                   <div class="flex flex-col sm:flex-row gap-4 max-w-lg">
                      <input type="email" [placeholder]="'HOME.EMAIL_PLACEHOLDER' | translate" 
                             class="flex-1 bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-white placeholder:text-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white/20 transition-all">
                      <button class="px-8 py-4 bg-white text-black font-black uppercase tracking-wider rounded-lg hover:bg-pink-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
                        {{ 'HOME.SUBSCRIBE' | translate }}
                      </button>
                   </div>
                   <p class="mt-4 text-xs text-gray-500">
                     By subscribing you agree to our Terms & Privacy Policy.
                   </p>
                </div>
                
                <div class="hidden md:flex justify-center">
                   <div class="w-64 h-64 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                      <i class="far fa-envelope-open text-8xl text-white"></i>
                   </div>
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
            this.slides.set(fakeSlides);
            this.activeSlide.set(fakeSlides[0]);
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
