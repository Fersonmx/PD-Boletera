import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="px-0 sm:px-0 lg:px-0">
      <div class="sm:flex sm:items-center justify-between mb-8">
        <div class="sm:flex-auto">
          <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tight">Orders</h1>
          <p class="mt-2 text-sm text-gray-500">Real-time overview of ticket sales and transactions.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button type="button" class="block rounded-lg bg-black px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5">Export Data</button>
        </div>
      </div>

       <!-- Search Bar -->
      <div class="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
         <div class="relative flex-1">
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Search by Order ID or Customer Name/Email..." class="w-full pl-10 pr-4 py-2.5 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-medium">
             <i class="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
         </div>
         <button (click)="onSearch()" class="px-6 py-2.5 bg-black text-white rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-gray-800 transition-colors">Search</button>
      </div>

      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-2xl bg-white border border-gray-100">
              <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 sm:pl-6">Order ID</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Customer</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Event Details</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Total</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  @for (order of orders(); track order.id) {
                    <tr class="hover:bg-pink-50/20 transition-colors group">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-black text-gray-900 sm:pl-6">#{{ order.id }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div class="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{{ order.User?.name || 'Guest' }}</div>
                        <div class="text-xs text-gray-400">{{ order.User?.email || 'No email' }}</div>
                      </td>
                      <td class="px-3 py-4 text-sm text-gray-500">
                        @for (item of order.OrderItems; track item.id) {
                            <div class="mb-1 flex items-center gap-2">
                                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">{{ item.quantity }}</span> 
                                <span class="font-medium text-gray-900">{{ item.Ticket?.name }}</span>
                                <span class="text-xs text-pink-500 font-bold uppercase tracking-wide truncate max-w-[150px]">{{ item.Ticket?.Event?.title }}</span>
                            </div>
                        }
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm font-black text-gray-900">\${{ order.totalAmount }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 uppercase tracking-wide">
                            {{ order.status }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-xs font-medium text-gray-400 uppercase tracking-wide">{{ order.createdAt | date:'MMM d, h:mm a' }}</td>
                    </tr>
                  }
                  @if (orders().length === 0) {
                    <tr>
                        <td colspan="6" class="text-center py-12 text-gray-400 italic">No orders found.</td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Pagination -->
              <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <span class="text-xs font-bold uppercase tracking-wide text-gray-500">Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} Total)</span>
                   <div class="flex gap-2">
                        <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                        <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                   </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdersListComponent implements OnInit {
  orders = signal<any[]>([]);

  // Pagination & Search
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  searchQuery = '';
  limit = 10;

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders({ page: this.currentPage, limit: this.limit, search: this.searchQuery }).subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.totalPages = res.pages;
        this.currentPage = res.page;
        this.totalItems = res.total;
      },
      error: (err) => console.error('Failed to load orders', err)
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadOrders();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }
}
