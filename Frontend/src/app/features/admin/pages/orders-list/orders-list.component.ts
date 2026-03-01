import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, TranslateModule],
  template: `
    <div class="px-0 sm:px-0 lg:px-0">
      <div class="sm:flex sm:items-center justify-between mb-8">
        <div class="sm:flex-auto">
          <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tight">{{ 'ADMIN.ORDERS_LIST.TITLE' | translate }}</h1>
          <p class="mt-2 text-sm text-gray-500">Real-time overview of ticket sales and transactions.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button type="button" (click)="exportData()" class="block rounded-lg bg-black px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5">
            <i class="fas fa-file-export mr-2"></i> {{ 'ADMIN.ORDERS_LIST.BTN_EXPORT' | translate }}
          </button>
        </div>
      </div>

       <!-- Search Bar -->
      <div class="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
         <div class="relative flex-1">
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" [placeholder]="'ADMIN.ORDERS_LIST.SEARCH' | translate" class="w-full pl-10 pr-4 py-2.5 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-medium">
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
                    <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 sm:pl-6">{{ 'ADMIN.ORDERS_LIST.TH_ORDER' | translate }} ID</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.ORDERS_LIST.TH_CUSTOMER' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.EVENTS_LIST.TH_EVENT' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.ORDERS_LIST.TH_TOTAL' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.ORDERS_LIST.TH_STATUS' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.ORDERS_LIST.TH_DATE' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.ORDERS_LIST.TH_ACTION' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  @for (order of orders(); track order.id) {
                    <tr class="hover:bg-pink-50/20 transition-colors group">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-black text-gray-900 sm:pl-6">#{{ order.id }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div class="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{{ order.User?.name || order.guestName || 'Guest' }}</div>
                        <div class="text-xs text-gray-400">{{ order.User?.email || order.guestEmail || 'No email' }}</div>
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
                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                              [ngClass]="{
                                'bg-green-100 text-green-700': order.status === 'completed',
                                'bg-yellow-100 text-yellow-700': order.status === 'pending',
                                'bg-red-100 text-red-700': order.status === 'cancelled'
                              }">
                            {{ order.status }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-xs font-medium text-gray-400 uppercase tracking-wide">{{ order.createdAt | date:'MMM d, h:mm a' }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                        <button (click)="viewDetails(order)" class="text-indigo-600 hover:text-indigo-900 font-bold text-xs uppercase tracking-wide bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                            {{ 'ADMIN.ORDERS_LIST.BTN_VIEW' | translate }}
                        </button>
                      </td>
                    </tr>
                  }
                  @if (orders().length === 0) {
                    <tr>
                        <td colspan="7" class="text-center py-12 text-gray-400 italic">{{ 'ADMIN.ORDERS_LIST.EMPTY' | translate }}</td>
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

    <!-- Order Details Modal -->
    @if (selectedOrder()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
            
            <div class="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                <!-- Modal Header -->
                <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50">
                    <div>
                        <h3 class="text-lg font-black text-gray-900">Order #{{ selectedOrder().id }}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">{{ selectedOrder().createdAt | date:'fullDate' }}</p>
                    </div>
                    <button (click)="closeModal()" class="text-gray-400 hover:text-gray-500 focus:outline-none bg-white rounded-full p-1 hover:bg-gray-100 transition-colors">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 overflow-y-auto px-6 py-6">
                    <!-- Customer Info -->
                    <div class="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Customer</p>
                            <p class="text-sm font-bold text-gray-900">{{ selectedOrder().User?.name || selectedOrder().guestName || 'Guest' }}</p>
                            <p class="text-xs text-gray-500">{{ selectedOrder().User?.email || selectedOrder().guestEmail }}</p>
                        </div>
                        <div class="text-right">
                             <p class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Payment</p>
                             <p class="text-sm font-bold text-gray-900">\${{ selectedOrder().totalAmount }}</p>
                             <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mt-1"
                                  [ngClass]="{
                                    'bg-green-100 text-green-700': selectedOrder().status === 'completed',
                                    'bg-yellow-100 text-yellow-700': selectedOrder().status === 'pending',
                                    'bg-red-100 text-red-700': selectedOrder().status === 'cancelled'
                                  }">
                                {{ selectedOrder().status }}
                            </span>
                        </div>
                    </div>

                    <!-- Items List -->
                    <h4 class="text-sm font-black text-gray-900 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">Order Items</h4>
                    <div class="space-y-4">
                        @for (item of selectedOrder().OrderItems; track item.id) {
                            <div class="flex items-start gap-4">
                                <div class="h-12 w-12 flex-none rounded-lg bg-gray-100 flex items-center justify-center">
                                    <i class="fas fa-ticket-alt text-gray-400 text-xl"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-bold text-gray-900 truncate">{{ item.Ticket?.name }}</p>
                                    <p class="text-xs text-pink-600 font-bold uppercase tracking-wide">{{ item.Ticket?.Event?.title }}</p>
                                    <p class="text-xs text-gray-500 mt-0.5">{{ item.quantity }} x \${{ item.price }}</p>
                                </div>
                                <div class="text-sm font-bold text-gray-900">
                                    \${{ item.quantity * item.price }}
                                </div>
                            </div>
                        }
                    </div>

                     <!-- Unique Codes -->
                    <h4 class="text-sm font-black text-gray-900 uppercase tracking-wide mb-3 mt-8 border-b border-gray-100 pb-2">Tickets Generated</h4>
                    <div class="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Ticket Type</th>
                                    <th class="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Unique Code</th>
                                    <th class="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">Used</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 bg-white">
                                @for (ticket of selectedOrder().OrderTickets; track ticket.id) {
                                    <tr>
                                        <td class="px-4 py-2 text-xs font-medium text-gray-900">{{ ticket.Ticket?.name }}</td>
                                        <td class="px-4 py-2 text-xs font-mono text-gray-500 text-right">{{ ticket.uniqueCode }}</td>
                                        <td class="px-4 py-2 text-center">
                                            <span class="inline-flex h-2 w-2 rounded-full" [ngClass]="ticket.isUsed ? 'bg-red-500' : 'bg-green-500'"></span>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="bg-gray-50 px-6 py-4 flex justify-end">
                    <button (click)="closeModal()" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors uppercase tracking-wide">
                        Close
                    </button>
                </div>
            </div>
        </div>
    }
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

  exportData() {
    this.orderService.exportOrders({ search: this.searchQuery }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Export failed', err)
    });
  }

  selectedOrder = signal<any>(null);

  viewDetails(order: any) {
    this.selectedOrder.set(order);
  }

  closeModal() {
    this.selectedOrder.set(null);
  }
}
