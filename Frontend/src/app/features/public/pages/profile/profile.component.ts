import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
   selector: 'app-profile',
   standalone: true,
   imports: [CommonModule, DatePipe, RouterLink, TranslateModule, FormsModule],
   template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900">{{ 'PROFILE.TITLE' | translate }}</h1>
          <p class="mt-2 text-gray-600">{{ 'PROFILE.SUBTITLE' | translate }}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Sidebar / User Info -->
          <div class="lg:col-span-1">
             <div class="bg-white rounded-xl shadow-sm p-6">
                <!-- User Info Display Mode -->
                <div *ngIf="!isEditing()" class="mb-6">
                    <div class="flex items-center space-x-4 mb-6">
                       <div class="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-2xl font-bold">
                          {{ authService.currentUserSig()?.name?.charAt(0) || 'U' }}
                       </div>
                       <div class="overflow-hidden">
                          <h2 class="text-xl font-bold text-gray-900 truncate">{{ authService.currentUserSig()?.name }}</h2>
                          <p class="text-sm text-gray-500 truncate">{{ authService.currentUserSig()?.email }}</p>
                          <p *ngIf="authService.currentUserSig()?.role === 'user'" class="text-xs text-gray-400 mt-1">
                             {{ $any(authService.currentUserSig())?.phoneNumber || 'No phone' }}
                          </p>
                       </div>
                    </div>
                    <button (click)="startEditing()" class="w-full mb-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                      Edit Profile
                    </button>
                    <button (click)="authService.logout()" class="w-full py-2 border border-transparent bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition">
                      {{ 'PROFILE.SIGN_OUT' | translate }}
                    </button>
                </div>

                <!-- Edit Mode -->
                <div *ngIf="isEditing()" class="mb-6">
                    <h3 class="text-lg font-bold mb-4">Edit Profile</h3>
                    <form (ngSubmit)="saveProfile()" class="space-y-4">
                        <div>
                            <label class="block text-xs text-gray-500">Name</label>
                            <input [(ngModel)]="editName" name="editName" class="w-full p-2 border rounded">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500">Email</label>
                            <input [(ngModel)]="editEmail" name="editEmail" class="w-full p-2 border rounded">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500">Phone</label>
                            <input [(ngModel)]="editPhone" name="editPhone" class="w-full p-2 border rounded">
                        </div>
                        <div class="flex space-x-2 pt-2">
                            <button type="submit" class="flex-1 bg-pink-600 text-white py-2 rounded hover:bg-pink-700">Save</button>
                            <button type="button" (click)="cancelEditing()" class="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">Cancel</button>
                        </div>
                    </form>
                </div>

             </div>
          </div>

          <!-- Main Content / Orders -->
          <div class="lg:col-span-2 space-y-6">
            <h2 class="text-2xl font-bold text-gray-900">{{ 'PROFILE.ORDER_HISTORY' | translate }}</h2>
            
            @if (isLoading()) {
               <div class="flex justify-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
               </div>
            } @else if (orders().length === 0) {
               <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div class="text-gray-400 mb-4 text-4xl"><i class="fas fa-ticket-alt"></i></div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'PROFILE.NO_ORDERS' | translate }}</h3>
                  <p class="text-gray-500 mb-6">{{ 'PROFILE.NO_ORDERS_DESC' | translate }}</p>
                  <a routerLink="/" class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition">
                    {{ 'PROFILE.BROWSE_EVENTS' | translate }}
                  </a>
               </div>
            } @else {
               @for (order of orders(); track order.id) {
                 <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-pink-300 transition-colors">
                    <!-- Order Header -->
                    <div class="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-100">
                       <div class="flex gap-6 text-sm">
                          <div>
                             <span class="block text-gray-500">{{ 'PROFILE.ORDER.PLACED' | translate }}</span>
                             <span class="font-medium text-gray-900">{{ order.createdAt | date:'mediumDate' }}</span>
                          </div>
                          <div>
                             <span class="block text-gray-500">{{ 'PROFILE.ORDER.TOTAL' | translate }}</span>
                             <span class="font-medium text-gray-900">\${{ order.totalAmount }}</span>
                          </div>
                          <div>
                             <span class="block text-gray-500">{{ 'PROFILE.ORDER.NUMBER' | translate }}</span>
                             <span class="font-medium text-gray-900">{{ order.id }}</span>
                          </div>
                       </div>
                       <div class="mt-4 sm:mt-0">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase tracking-wide">
                            {{ order.status }}
                          </span>
                       </div>
                    </div>

                    <!-- Order Items -->
                    <div class="p-6">
                       @for (item of order.OrderItems; track item.id) {
                          <div class="flex items-start justify-between py-4 border-b border-gray-100 last:border-0 last:pb-0 first:pt-0">
                             <div class="flex gap-4">
                                <div class="h-16 w-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                   <!-- Placeholder or Event Image if available -->
                                   <img [src]="getImageUrl(item.Ticket?.Event?.imageUrl) || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=200&q=80'" class="w-full h-full object-cover">
                                </div>
                                <div>
                                   <h4 class="text-lg font-bold text-gray-900">{{ item.Ticket?.Event?.title || 'Event Name' }}</h4>
                                   <p class="text-gray-600 text-sm">{{ item.Ticket?.name }} Ticket</p>
                                   <p class="text-gray-500 text-xs mt-1">{{ item.Ticket?.Event?.venue?.name }}</p>
                                </div>
                             </div>
                             <div class="text-right">
                                <p class="font-medium text-gray-900">{{ 'PROFILE.ORDER.QTY' | translate }}: {{ item.quantity }}</p>
                                <a [routerLink]="['/tickets', order.id]" class="mt-2 inline-block text-pink-600 hover:text-pink-800 text-sm font-bold uppercase tracking-wider">
                                   {{ 'PROFILE.ORDER.VIEW_TICKET' | translate }}
                                </a>
                             </div>
                          </div>
                       }
                    </div>
                 </div>
               }
            }

          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
   orders = signal<any[]>([]);
   isLoading = signal<boolean>(true);
   isEditing = signal<boolean>(false);

   editName = '';
   editEmail = '';
   editPhone = '';

   constructor(
      private orderService: OrderService,
      public authService: AuthService
   ) { }

   ngOnInit() {
      this.loadOrders();
   }

   loadOrders() {
      this.orderService.getMyOrders().subscribe({
         next: (data) => {
            this.orders.set(data);
            this.isLoading.set(false);
         },
         error: (err) => {
            console.error('Failed to fetch orders', err);
            this.isLoading.set(false);
         }
      });
   }

   startEditing() {
      const user = this.authService.currentUserSig();
      if (user) {
         this.editName = user.name;
         this.editEmail = user.email;
         // We need to cast or extend interface to include phoneNumber if not in User type yet
         this.editPhone = (user as any).phoneNumber || '';
         this.isEditing.set(true);
      }
   }

   cancelEditing() {
      this.isEditing.set(false);
   }

   saveProfile() {
      this.authService.updateProfile({
         name: this.editName,
         email: this.editEmail,
         phoneNumber: this.editPhone
      }).subscribe({
         next: () => {
            this.isEditing.set(false);
            // Re-fetch orders or anything else if needed, 
            // but layout updates via signal automatically from AuthService
         },
         error: (err) => alert('Failed to update profile: ' + (err.error?.message || err.message))
      });
   }

   getImageUrl(path: string | undefined): string {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      const baseUrl = environment.apiUrl.replace('/api', '');
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      return `${baseUrl}${normalizedPath}`;
   }
}
