import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService, Event } from '../../../../core/services/event.service';
import { CategoryService, Category } from '../../../../core/services/category.service';


import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-events-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- ... (header code remains same) ... -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tight">Events Management</h1>
        <div class="flex gap-3">
             <button (click)="openCategoryModal()" class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold uppercase tracking-wider text-sm shadow-sm">
              <i class="fas fa-tags"></i> Categories
            </button>
            <a routerLink="/admin/events/new" class="px-5 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 font-bold uppercase tracking-wider text-sm shadow-lg shadow-pink-200">
              <i class="fas fa-plus"></i> Create Event
            </a>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <div class="relative flex-1">
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Search by title or description..." class="w-full pl-10 pr-4 py-2.5 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-medium">
             <i class="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
         </div>
         <button (click)="onSearch()" class="px-6 py-2.5 bg-black text-white rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-gray-800 transition-colors">Search</button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              @for (event of events(); track event.id) {
                <tr class="hover:bg-pink-50/30 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-12 w-12 flex-shrink-0">
                        <img class="h-12 w-12 rounded-lg object-cover shadow-sm group-hover:scale-110 transition-transform" [src]="getImageUrl(event.imageUrl) || 'https://via.placeholder.com/40'" alt="">
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-bold text-gray-900">{{ event.title }}</div>
                        <div class="text-xs text-pink-500 font-bold uppercase tracking-wide">{{ event.Category?.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ event.date | date:'mediumDate' }}</div>
                    <div class="text-xs text-gray-500">{{ event.date | date:'shortTime' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ event.Venue?.name }}</div>
                    <div class="text-xs text-gray-500">{{ event.Venue?.city }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                     <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide"
                        [ngClass]="getStatusClass(event)">
                      {{ getEventStatusDisplay(event) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a [routerLink]="['/admin/events/edit', event.id]" class="text-pink-600 hover:text-pink-900 mr-4 font-bold uppercase text-xs tracking-wider">Edit</a>
                    <button class="text-gray-400 hover:text-red-600 font-bold uppercase text-xs tracking-wider transition-colors">Delete</button>
                  </td>
                </tr>
              }
              @if (events().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    No events found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
             <span class="text-xs font-bold uppercase tracking-wide text-gray-500">Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} Total)</span>
             <div class="flex gap-2">
                  <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                  <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
             </div>
        </div>
      </div>

      <!-- Categories Modal -->
      @if (showCategoryModal) {
          <div class="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                    <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Manage Categories</h3>
                                    <div class="mt-4">
                                        <!-- Add Form -->
                                        <div class="flex gap-2 mb-4">
                                            <input type="text" [(ngModel)]="newCategoryName" placeholder="New Category Name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6">
                                            <button (click)="addCategory()" [disabled]="!newCategoryName" class="rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 disabled:opacity-50">Add</button>
                                        </div>

                                        <!-- List -->
                                        <ul class="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                            @for (cat of categories(); track cat.id) {
                                                <li class="flex justify-between gap-x-6 py-3">
                                                    <div class="flex min-w-0 gap-x-4">
                                                        <div class="min-w-0 flex-auto">
                                                            <p class="text-sm font-semibold leading-6 text-gray-900">{{ cat.name }}</p>
                                                            <p class="mt-1 truncate text-xs leading-5 text-gray-500">/{{ cat.slug }}</p>
                                                        </div>
                                                    </div>
                                                    <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                                                        <button (click)="deleteCategory(cat.id)" class="text-gray-400 hover:text-red-500 text-xs font-bold uppercase tracking-wider">Delete</button>
                                                    </div>
                                                </li>
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button type="button" (click)="closeCategoryModal()" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Close</button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      }

    </div>
  `
})
export class EventsListComponent implements OnInit {
  events = signal<Event[]>([]);
  categories = signal<Category[]>([]);
  showCategoryModal = false;
  newCategoryName = '';

  // Pagination & Search
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  searchQuery = '';
  limit = 10;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents({ page: this.currentPage, limit: this.limit, search: this.searchQuery }).subscribe(res => {
      this.events.set(res.events);
      this.totalPages = res.pages;
      this.currentPage = res.page;
      this.totalItems = res.total;
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadEvents();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEvents();
    }
  }

  // Status Logic
  getEventStatusDisplay(event: Event): string {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now && event.status !== 'cancelled') {
      return 'Expired';
    }
    return event.status;
  }

  getStatusClass(event: Event): string {
    const status = this.getEventStatusDisplay(event).toLowerCase();
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  // Category Modal Logic
  openCategoryModal() {
    this.showCategoryModal = true;
    this.loadCategories();
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(cats => this.categories.set(cats));
  }

  addCategory() {
    if (!this.newCategoryName) return;
    const slug = this.newCategoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    this.categoryService.createCategory({ name: this.newCategoryName, slug }).subscribe(() => {
      this.newCategoryName = '';
      this.loadCategories();
    });
  }

  deleteCategory(id: number) {
    if (confirm('Delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }
}
