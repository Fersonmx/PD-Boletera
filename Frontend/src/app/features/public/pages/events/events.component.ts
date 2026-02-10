import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService, Event } from '../../../../core/services/event.service';
import { CategoryService, Category } from '../../../../core/services/category.service';

import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, TranslateModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-12 selection:bg-pink-500 selection:text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header & Search -->
        <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
              <h1 class="text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">{{ 'EVENTS.TITLE' | translate }}</h1>
              <p class="text-gray-500">Discover trending concerts, sports, and theater events.</p>
          </div>
          
          <div class="w-full md:w-96">
            <div class="relative rounded-md shadow-sm">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                class="focus:ring-pink-500 focus:border-pink-500 block w-full pl-5 pr-12 text-base border-gray-300 rounded-lg h-12 font-bold text-gray-900 shadow-sm" 
                placeholder="{{ 'EVENTS.SEARCH_PLACEHOLDER' | translate }}">
              <div class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" (click)="onSearch()">
                <i class="fas fa-search text-gray-400 hover:text-pink-600 transition-colors"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <!-- Filters -->
        <div class="flex flex-wrap gap-3 mb-10 pb-4 border-b border-gray-200">
          <button 
            (click)="selectCategory(null)"
            [class]="selectedCategory() === null 
                ? 'px-5 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-lg' 
                : 'px-5 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-pink-600 transition shadow-sm'">
            {{ 'EVENTS.ALL' | translate }}
          </button>
          
          @for (cat of categories(); track cat.id) {
            <button 
                (click)="selectCategory(cat.id)"
                [class]="selectedCategory() === cat.id 
                    ? 'px-5 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-lg' 
                    : 'px-5 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-pink-600 transition shadow-sm'">
                {{ cat.name }}
            </button>
          }
        </div>

        <!-- Events Grid -->
        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        }

        @if (!isLoading() && filteredEvents().length === 0) {
           <div class="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
             <div class="text-4xl text-gray-300 mb-4"><i class="far fa-calendar-times"></i></div>
             <h3 class="mt-2 text-lg font-bold text-gray-900">{{ 'EVENTS.NO_EVENTS' | translate }}</h3>
             <p class="mt-1 text-gray-500">{{ 'EVENTS.NO_EVENTS_DESC' | translate }}</p>
           </div>
        }

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (event of filteredEvents(); track event.id) {
            <div class="group flex flex-col h-full bg-white rounded-lg transition-transform duration-300 hover:-translate-y-1 cursor-pointer" [routerLink]="['/events', event.id]">
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

                 <!-- Category Tag -->
                 <div class="absolute bottom-3 left-3">
                    <span class="inline-block px-2 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded">
                        {{ event.Category?.slug || 'Event' }}
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

                    <span class="inline-flex items-center text-xs font-bold uppercase tracking-wider text-pink-600 hover:text-pink-800 transition-colors whitespace-nowrap">
                        {{ 'HOME.FIND_TICKETS' | translate }}
                        <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                    </span>
                 </div>
              </div>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class EventsComponent implements OnInit {
  events = signal<Event[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');
  selectedCategory = signal<number | null>(null);

  // No longer strictly needed if we rely on backend for filtering, 
  // but we can keep it for client-side rapid filtering or mixed approach.
  // For 'Search' requirement, we usually want backend search.
  // We'll use this computed to just render 'events', but effectively 
  // 'events' will be populated by the backend search result.
  filteredEvents = computed(() => {
    return this.events();
  });

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      const search = params['search'] || '';
      const categoryId = params['category'] ? Number(params['category']) : null;

      this.searchQuery.set(search);
      this.selectedCategory.set(categoryId);

      this.loadEvents(search, categoryId);
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadEvents(search: string = '', categoryId: number | null = null) {
    this.isLoading.set(true);

    const params: any = { search };
    if (categoryId) params.categoryId = categoryId;

    this.eventService.getEvents(params).subscribe({
      next: (data) => {
        // Filter by published status just in case backend returns everything
        // But backend seems to handle some logic. 
        // Let's assume backend returns what we need, or we filter client side too.
        // For now, trusting backend results which supposedly handles 'like %search%'.
        // We still might want to filter 'published' if backend doesn't enforce it for public.
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const published = data.events.filter(e => {
          const eventDate = new Date(e.date);
          const eventDateOnly = new Date(eventDate);
          eventDateOnly.setHours(0, 0, 0, 0);
          return e.status === 'published' && eventDateOnly.getTime() >= now.getTime();
        });
        this.events.set(published);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    this.updateParams();
  }

  selectCategory(id: number | null) {
    this.selectedCategory.set(id);
    this.updateParams();
  }

  updateParams() {
    const queryParams: any = {};
    if (this.searchQuery()) queryParams.search = this.searchQuery();
    if (this.selectedCategory()) queryParams.category = this.selectedCategory();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  getMinPrice(event: Event): number {
    if (!event.Tickets || event.Tickets.length === 0) return 0;
    return Math.min(...event.Tickets.map(t => t.price));
  }
}
