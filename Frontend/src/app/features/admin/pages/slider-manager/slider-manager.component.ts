import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../../core/services/content.service';
import { EventService } from '../../../../core/services/event.service';
import { CategoryService } from '../../../../core/services/category.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-slider-manager',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
           <h1 class="text-2xl font-bold text-gray-900">Hero Slider</h1>
           <p class="text-gray-500 text-sm">Manage Home Page Highlights</p>
        </div>
        <button (click)="showForm = true" class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition flex items-center gap-2">
           <i class="fas fa-plus"></i> Add Slide
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-6 md:items-center shadow-inner">
          <div class="flex-shrink-0">
              <h4 class="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <i class="fas fa-magic text-pink-500"></i> Defaults
              </h4>
              <button (click)="addLatestSlides()" [disabled]="isBulkLoading" class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-bold shadow-lg shadow-gray-200 transition-all disabled:opacity-50">
                   @if(isBulkLoading){ <i class="fas fa-spinner fa-spin mr-2"></i> }
                   @else { <i class="fas fa-clock mr-2"></i> }
                   Add Last 5 Created
              </button>
          </div>
          
          <div class="hidden md:block h-10 w-px bg-gray-300"></div>

          <div class="flex-grow">
               <h4 class="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                   <i class="fas fa-filter text-pink-500"></i> From Category
               </h4>
               <div class="flex gap-2">
                   <select [(ngModel)]="selectedCategoryId" class="border-gray-300 rounded-lg text-sm min-w-[200px] flex-grow md:flex-grow-0">
                       <option [ngValue]="null">Select Category</option>
                       @for(cat of categories(); track cat.id) {
                           <option [value]="cat.id">{{ cat.name }}</option>
                       }
                   </select>
                   <button (click)="addCategorySlides()" [disabled]="!selectedCategoryId || isBulkLoading" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50">
                       @if(isBulkLoading){ <i class="fas fa-spinner fa-spin mr-2"></i> }
                       @else { <i class="fas fa-plus mr-2"></i> }
                       Add Top 5
                   </button>
               </div>
          </div>
      </div>

      <!-- Form -->
      @if(showForm) {
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fadeIn">
              <h3 class="text-lg font-bold mb-4">New Slide</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Select Event</label>
                      <select [(ngModel)]="newSlide.eventId" class="w-full border-gray-300 rounded-lg">
                          @for(event of events(); track event.id) {
                              <option [value]="event.id">{{ event.title }} ({{ event.date | date }})</option>
                          }
                      </select>
                  </div>
                  <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Title (Optional)</label>
                      <input [(ngModel)]="newSlide.title" placeholder="Override event name" class="w-full border-gray-300 rounded-lg">
                  </div>
                  <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Subtitle (Optional)</label>
                      <input [(ngModel)]="newSlide.subtitle" placeholder="Marketing tagline" class="w-full border-gray-300 rounded-lg">
                  </div>
                   <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Order</label>
                      <input [(ngModel)]="newSlide.order" type="number" class="w-full border-gray-300 rounded-lg">
                  </div>
              </div>
              <!-- Simplify image for now: use event image by default or URL input -->
              <div class="mt-4">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Image URL (Optional)</label>
                  <input [(ngModel)]="newSlide.imageUrl" placeholder="https://..." class="w-full border-gray-300 rounded-lg">
              </div>

              <div class="flex justify-end gap-2 mt-4">
                  <button (click)="cancelCreate()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button (click)="createSlide()" [disabled]="!newSlide.eventId" class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">Save</button>
              </div>
          </div>
      }

      <!-- List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (slide of slides(); track slide.id; let i = $index) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-move"
                   draggable="true" 
                   (dragstart)="onDragStart(i)" 
                   (dragover)="onDragOver($event)" 
                   (drop)="onDrop($event, i)"
                   [class.opacity-50]="draggedIndex === i"
                   [class.border-pink-500]="dragOverIndex === i"
                   [class.border-2]="dragOverIndex === i"
                   (dragenter)="dragOverIndex = i"
                   (dragleave)="dragOverIndex = null"
                   (dragend)="draggedIndex = null; dragOverIndex = null">
                  
                  <div class="h-40 bg-gray-200 relative pointer-events-none">
                      <img [src]="getImageUrl(slide.imageUrl || slide.event?.imageUrl) || 'assets/placeholder-event.jpg'" class="w-full h-full object-cover select-none">
                      <div class="absolute top-2 right-2 flex gap-1 pointer-events-auto">
                          <button (click)="deleteSlide(slide.id); $event.stopPropagation()" class="bg-white/90 p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"><i class="fas fa-trash"></i></button>
                      </div>
                      <div class="absolute top-2 left-2 bg-white/90 p-2 rounded-full text-gray-400 shadow-sm pointer-events-auto cursor-move">
                          <i class="fas fa-grip-vertical"></i>
                      </div>
                      <div class="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold pointer-events-auto">
                          Order: {{ slide.order }}
                      </div>
                  </div>
                  <div class="p-4 pointer-events-none">
                      <h3 class="font-bold text-gray-900 truncate">{{ slide.title || slide.event?.title }}</h3>
                      <p class="text-xs text-gray-500 truncate">{{ slide.subtitle || (slide.event?.date | date:'mediumDate') }}</p>
                  </div>
              </div>
          }
      </div>
    </div>
  `
})
export class SliderManagerComponent implements OnInit {
    slides = signal<any[]>([]);
    events = signal<any[]>([]);
    showForm = false;

    newSlide = {
        eventId: null,
        title: '',
        subtitle: '',
        imageUrl: '',
        order: 0,
        isActive: true
    };

    categories = signal<any[]>([]);
    selectedCategoryId: number | null = null;
    isBulkLoading = false;

    // Drag and Drop state
    draggedIndex: number | null = null;
    dragOverIndex: number | null = null;

    constructor(
        private contentService: ContentService,
        private eventService: EventService, // Assuming exists to list events
        private categoryService: CategoryService
    ) { }

    ngOnInit() {
        this.loadSlides();
        this.loadEvents();
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getCategories().subscribe(cats => this.categories.set(cats));
    }

    loadSlides() {
        this.contentService.getHeroSlides().subscribe(data => this.slides.set(data));
    }

    loadEvents() {
        // Fetch many events and filter for upcoming only
        this.eventService.getEvents({ limit: 1000 }).subscribe(res => {
            const allEvents = res.events || res;
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Start of today

            // Filter: Date must be Today or Future
            const activeEvents = allEvents.filter((e: any) => new Date(e.date) >= now);
            this.events.set(activeEvents);
        });
    }

    // --- Quick Defaults ---
    addLatestSlides() {
        if (!confirm('This will append the 5 most recently created events to the slider. Continue?')) return;

        this.isBulkLoading = true;
        this.eventService.getEvents({ limit: 5, sort: 'created_desc' }).subscribe({
            next: (res) => {
                const events = res.events || res;
                this.bulkAddSlides(events);
            },
            error: () => this.isBulkLoading = false
        });
    }

    addCategorySlides() {
        if (!this.selectedCategoryId) return;
        if (!confirm('This will append the top 5 upcoming events from this category. Continue?')) return;

        this.isBulkLoading = true;
        this.eventService.getEvents({ limit: 5, categoryId: this.selectedCategoryId }).subscribe({
            next: (res) => {
                const events = res.events || res;
                this.bulkAddSlides(events);
            },
            error: () => this.isBulkLoading = false
        });
    }

    private bulkAddSlides(events: any[]) {
        if (!events || events.length === 0) {
            alert('No events found for this selection.');
            this.isBulkLoading = false;
            return;
        }

        let completed = 0;
        let errors = 0;
        // Determine starting order index
        const currentMaxOrder = this.slides().reduce((max, s) => Math.max(max, s.order || 0), 0);

        events.forEach((event, index) => {
            const slide = {
                eventId: event.id,
                title: '',
                subtitle: '',
                imageUrl: '',
                order: currentMaxOrder + index + 1,
                isActive: true
            };

            this.contentService.createHeroSlide(slide).subscribe({
                next: () => {
                    completed++;
                    this.checkBulkComplete(completed + errors, events.length);
                },
                error: () => {
                    errors++;
                    this.checkBulkComplete(completed + errors, events.length);
                }
            });
        });
    }

    private checkBulkComplete(totalProcessed: number, totalExpected: number) {
        if (totalProcessed === totalExpected) {
            this.isBulkLoading = false;
            this.loadSlides();
            // alert('Slides added successfully!');
        }
    }

    // --- Single Slide CRUD ---

    createSlide() {
        this.contentService.createHeroSlide(this.newSlide).subscribe({
            next: () => {
                this.loadSlides();
                this.cancelCreate();
            },
            error: () => alert('Error creating slide')
        });
    }

    deleteSlide(id: number) {
        if (confirm('Delete slide?')) {
            this.contentService.deleteHeroSlide(id).subscribe(() => this.loadSlides());
        }
    }

    cancelCreate() {
        this.showForm = false;
        this.newSlide = { eventId: null, title: '', subtitle: '', imageUrl: '', order: 0, isActive: true };
    }

    getImageUrl(path: string | undefined): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // baseUrl is http://localhost:3001
        if (path.startsWith('/uploads')) {
            path = '/api' + path;
        }
        const baseUrl = environment.apiUrl.replace('/api', '');
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${normalizedPath}`;
    }

    // --- Drag and Drop Logic ---

    onDragStart(index: number) {
        this.draggedIndex = index;
    }

    onDragOver(event: DragEvent) {
        // Prevent default to allow drop
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
    }

    onDrop(event: DragEvent, dropIndex: number) {
        event.preventDefault();

        if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
            this.draggedIndex = null;
            this.dragOverIndex = null;
            return;
        }

        const items = [...this.slides()];
        const [draggedItem] = items.splice(this.draggedIndex, 1);
        items.splice(dropIndex, 0, draggedItem);

        // Update the order locally
        items.forEach((item, index) => {
            item.order = index + 1;
        });

        this.slides.set(items);
        this.draggedIndex = null;
        this.dragOverIndex = null;

        // Save order to backend
        this.saveOrder(items);
    }

    private saveOrder(items: any[]) {
        let completed = 0;
        let errors = 0;

        items.forEach(item => {
            // Update each item's order 
            this.contentService.updateHeroSlide(item.id, { order: item.order }).subscribe({
                next: () => {
                    completed++;
                    // Assuming we don't need to do anything if updated successfully since it's fast
                },
                error: () => {
                    errors++;
                    console.error('Failed to update order for slide', item.id);
                }
            });
        });
    }

}
