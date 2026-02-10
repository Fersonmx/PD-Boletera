import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
        
        <!-- Decorative success background element -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce-short">
            <i class="bi bi-check-lg text-4xl text-green-600"></i>
          </div>
          
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
            {{ 'CONFIRMATION.TITLE' | translate }}
          </h2>
          <p class="text-gray-500">
            {{ 'CONFIRMATION.SUBTITLE' | translate }}
          </p>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
           <div class="flex justify-between py-2 text-sm">
              <span class="text-gray-500">{{ 'CONFIRMATION.ORDER_NUMBER' | translate }}</span>
              <span class="font-mono font-bold text-gray-900">#{{ orderId() }}</span>
           </div>
           <div class="flex justify-between py-2 text-sm">
              <span class="text-gray-500">{{ 'CONFIRMATION.TRANSACTION_ID' | translate }}</span>
              <span class="font-mono text-gray-600">tx_{{ generateTxId() }}</span>
           </div>
           <div class="flex justify-between py-2 text-sm">
              <span class="text-gray-500">{{ 'CONFIRMATION.DATE' | translate }}</span>
              <span class="text-gray-900">{{ today | date:'mediumDate' }}</span>
           </div>
           
           <!-- Fetching order details could go here, for now using passed ID -->
           
           <div class="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <span class="font-bold text-gray-700">{{ 'CONFIRMATION.TOTAL_PAID' | translate }}</span>
              <span class="text-xl font-bold text-green-600">{{ totalAmount() | currency }}</span>
           </div>
        </div>

        <div class="flex flex-col gap-3 mt-8">
           <a [routerLink]="['/tickets', orderId()]" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors uppercase tracking-wider">
              {{ 'CONFIRMATION.VIEW_TICKETS' | translate }}
           </a>
           <a routerLink="/" class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors uppercase tracking-wider">
              {{ 'CONFIRMATION.CONTINUE_SHOPPING' | translate }}
           </a>
        </div>
        
        <div class="mt-6 text-center text-xs text-gray-400">
          <p>Need help? Contact support&#64;boletera.com</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-bounce-short {
        animation: bounce 1s ;
    }
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
      40% {transform: translateY(-20px);}
      60% {transform: translateY(-10px);}
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  orderId = signal<string>('0000');
  totalAmount = signal<number>(0);
  today = new Date();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService // To potentially fetch real order if needed later
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId.set(params['id']);
    });

    // Simulate getting total from state or just show a success UI
    // In a real app we would fetch the order by ID here.
    // For now, we'll assume the user just paid successfully.
    // We can try to grab the last cart total if we stored it, or just generic.

    const passedTotal = history.state.total;
    if (passedTotal) {
      this.totalAmount.set(passedTotal);
    }
  }

  generateTxId() {
    return Math.random().toString(36).substring(7).toUpperCase();
  }
}
