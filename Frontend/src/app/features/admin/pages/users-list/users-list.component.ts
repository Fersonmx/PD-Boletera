import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { TranslateModule } from '@ngx-translate/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="px-0 sm:px-0 lg:px-0">
      <div class="sm:flex sm:items-center justify-between mb-8">
        <div class="sm:flex-auto">
          <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tight">{{ 'ADMIN.USERS_LIST.TITLE' | translate }}</h1>
          <p class="mt-2 text-sm text-gray-500">A list of all registered users/customers in your system.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
           <a routerLink="/admin/users/new" class="block rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{{ 'ADMIN.USERS_LIST.BTN_CREATE' | translate }}</a>
        </div>
      </div>
      
       <!-- Search Bar -->
      <div class="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
         <div class="relative flex-1">
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" [placeholder]="'ADMIN.USERS_LIST.SEARCH' | translate" class="w-full pl-10 pr-4 py-2.5 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-medium">
             <i class="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
         </div>
         <button (click)="onSearch()" class="px-6 py-2.5 bg-black text-white rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-gray-800 transition-colors">{{ 'HOME.SEARCH_BTN' | translate }}</button>
      </div>

      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-2xl bg-white border border-gray-100">
              <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 sm:pl-6">ID</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.USERS_LIST.TH_NAME' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.USERS_LIST.TH_EMAIL' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.USERS_LIST.TH_ROLE' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Joined</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">{{ 'ADMIN.USERS_LIST.BTN_EDIT' | translate }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  @for (user of users(); track user.id) {
                    <tr class="hover:bg-pink-50/20 transition-colors group">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-black text-gray-900 sm:pl-6">#{{ user.id }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{{ user.name }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ user.email }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                            [ngClass]="{
                                'bg-pink-100 text-pink-700': user.role === 'admin',
                                'bg-blue-50 text-blue-700': user.role !== 'admin'
                            }">
                            {{ user.role }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-xs font-medium text-gray-400 uppercase tracking-wide">{{ user.createdAt | date:'mediumDate' }}</td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                         <a [routerLink]="['/admin/users/edit', user.id]" class="text-indigo-600 hover:text-indigo-900 mr-4">{{ 'ADMIN.USERS_LIST.BTN_EDIT' | translate }}<span class="sr-only">, {{ user.name }}</span></a>
                      </td>
                    </tr>
                  }
                  @if (users().length === 0) {
                    <tr>
                        <td colspan="5" class="text-center py-12 text-gray-400 italic">{{ 'ADMIN.USERS_LIST.EMPTY' | translate }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Pagination -->
              <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <span class="text-xs font-bold uppercase tracking-wide text-gray-500">{{ 'ADMIN.EVENTS_LIST.PG_PAGE' | translate }} {{ currentPage }} {{ 'ADMIN.EVENTS_LIST.PG_OF' | translate }} {{ totalPages }} ({{ totalItems }} {{ 'ADMIN.EVENTS_LIST.PG_TOTAL' | translate }})</span>
                   <div class="flex gap-2">
                        <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{{ 'ADMIN.EVENTS_LIST.BTN_PREV' | translate }}</button>
                        <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{{ 'ADMIN.EVENTS_LIST.BTN_NEXT' | translate }}</button>
                   </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  users = signal<any[]>([]);

  // Pagination & Search
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  searchQuery = '';
  limit = 10;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers({ page: this.currentPage, limit: this.limit, search: this.searchQuery }).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.totalPages = res.pages;
        this.currentPage = res.page;
        this.totalItems = res.total;
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }
}
