import { Component, OnInit, signal, computed, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService, OrderItem } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PromoService } from '../../../../core/services/promo.service';

@Component({
   selector: 'app-checkout',
   standalone: true,
   imports: [CommonModule, FormsModule, TranslateModule],
   template: `
    <!-- Top Bar with Timer -->
    <div class="bg-indigo-900 text-white py-3 px-4 sticky top-0 z-50 shadow-md">
       <div class="max-w-7xl mx-auto flex justify-center items-center gap-4">
          <div class="bg-white/20 rounded px-3 py-1 font-mono font-bold text-xl tracking-wider">
             {{ formatTime(timeLeft()) }}
          </div>
          <p class="text-sm font-medium">Act fast! Secure your tickets now <i class="far fa-clock ml-1"></i></p>
       </div>
    </div>

    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Steps Indicator -->
        <div class="flex justify-center mb-12">
           <div class="flex items-center w-full max-w-3xl">
              <!-- Step 1 -->
              <div class="flex flex-col items-center relative z-10">
                 <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300"
                      [ngClass]="{'bg-indigo-600': step() >= 1, 'bg-gray-300': step() < 1}">1</div>
                 <span class="text-sm mt-2 font-medium" [ngClass]="{'text-indigo-900': step() >= 1, 'text-gray-400': step() < 1}">{{ 'CHECKOUT.STEPS.DELIVERY' | translate }}</span>
              </div>
              <div class="flex-grow h-1 bg-gray-200 mx-2 -mt-6">
                 <div class="h-full bg-indigo-600 transition-all duration-300" [style.width.%]="step() >= 2 ? 100 : 0"></div>
              </div>

              <!-- Step 2 -->
              <div class="flex flex-col items-center relative z-10">
                 <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300"
                      [ngClass]="{'bg-indigo-600': step() >= 2, 'bg-gray-300': step() < 2}">2</div>
                 <span class="text-sm mt-2 font-medium" [ngClass]="{'text-indigo-900': step() >= 2, 'text-gray-400': step() < 2}">{{ 'CHECKOUT.STEPS.BILLING' | translate }}</span>
              </div>
              <div class="flex-grow h-1 bg-gray-200 mx-2 -mt-6">
                 <div class="h-full bg-indigo-600 transition-all duration-300" [style.width.%]="step() >= 3 ? 100 : 0"></div>
              </div>

              <!-- Step 3 -->
              <div class="flex flex-col items-center relative z-10">
                 <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300"
                      [ngClass]="{'bg-indigo-600': step() >= 3, 'bg-gray-300': step() < 3}">3</div>
                 <span class="text-sm mt-2 font-medium" [ngClass]="{'text-indigo-900': step() >= 3, 'text-gray-400': step() < 3}">{{ 'CHECKOUT.STEPS.PLACE_ORDER' | translate }}</span>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <!-- Main Content Area -->
           <div class="lg:col-span-2 space-y-8">
              
              <!-- STEP 1: AUTH / GUEST (Only if not logged in)-->
              @if (!authService.isAuthenticated && !guestEmailConfirmed()) {
                 <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ 'CHECKOUT.TITLE' | translate }}</h2>
                    <div class="grid md:grid-cols-2 gap-8 relative">
                       <!-- Guest -->
                       <div>
                          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ 'CHECKOUT.GUEST.TITLE' | translate }}</h3>
                          <p class="text-gray-500 mb-4 text-sm">{{ 'CHECKOUT.GUEST.DESC' | translate }}</p>
                          <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.GUEST.EMAIL_LABEL' | translate }}</label>
                          <input type="email" [(ngModel)]="guestForm.email" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border" placeholder="user@example.com">
                          <button (click)="confirmGuest()" [disabled]="!guestForm.email" class="w-full mt-4 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition disabled:opacity-50">
                             {{ 'CHECKOUT.GUEST.CONTINUE' | translate }}
                          </button>
                       </div>
                       
                       <!-- Login -->
                       <div class="relative">
                          <!-- Divider -->
                          <div class="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-gray-200 -ml-4"></div>
                          
                          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ 'CHECKOUT.LOGIN.TITLE' | translate }}</h3>
                          <p class="text-gray-500 mb-4 text-sm">{{ 'CHECKOUT.LOGIN.DESC' | translate }}</p>
                                                    <div class="space-y-3">
                              <button (click)="login()" class="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition font-medium text-gray-700">
                                 <i class="fas fa-envelope text-gray-500 mr-2"></i> {{ 'CHECKOUT.LOGIN.TITLE' | translate }}
                              </button>
                           </div>

                          <!-- Register Section -->
                          <div class="mt-8 pt-6 border-t border-gray-100">
                              <h3 class="text-lg font-bold text-gray-900 mb-2">{{ 'CHECKOUT.REGISTER.TITLE' | translate }}</h3>
                              <p class="text-gray-500 mb-4 text-sm">{{ 'CHECKOUT.REGISTER.DESC' | translate }}</p>
                              <button (click)="register()" class="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
                                 {{ 'CHECKOUT.REGISTER.BUTTON' | translate }}
                              </button>
                          </div>
                       </div>
                    </div>
                 </div>
              }

              <!-- STEP 2: DELIVERY (Shown if Auth/Guest Confirmed) -->
              @if (authService.isAuthenticated || guestEmailConfirmed()) {
                 <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">{{ 'CHECKOUT.STEPS.DELIVERY' | translate }}</h2>
                        @if(step() > 1) { <span class="text-green-600"><i class="fas fa-check-circle"></i></span> }
                    </div>
                    
                    @if (step() === 1) {
                        <div class="border-2 border-pink-500 rounded-lg p-6 bg-pink-50/10">
                            <div class="flex items-start gap-4">
                                <div class="mt-1"><input type="radio" checked class="text-pink-600 focus:ring-pink-500 w-5 h-5"></div>
                                <div>
                                    <h3 class="font-bold text-gray-900">{{ 'CHECKOUT.DELIVERY.METHOD' | translate }}</h3>
                                    <p class="text-gray-600 mt-1">
                                        {{ 'CHECKOUT.DELIVERY.DESC' | translate }} <span class="font-bold text-gray-900">{{ guestEmailConfirmed() ? guestForm.email : authService.currentUserSig()?.email }}</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button (click)="nextStep()" class="mt-6 w-full py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition">
                             {{ 'CHECKOUT.STEPS.BILLING' | translate }}
                        </button>
                    }
                 </div>

                 <!-- STEP 3: BILLING -->
                 @if (step() >= 2) {
                     <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-8">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold text-gray-900">{{ 'CHECKOUT.STEPS.BILLING' | translate }}</h2>
                        </div>
                        
                        <!-- Payment Methods -->
                        <div class="space-y-4 mb-8">
                            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">{{ 'CHECKOUT.BILLING.PAYMENT_METHOD' | translate }}</h3>
                            <div class="grid sm:grid-cols-2 gap-4">
                                <label class="border-2 border-pink-500 rounded-lg p-4 flex items-center gap-3 cursor-pointer bg-pink-50/10">
                                    <input type="radio" name="payment" checked class="text-pink-600 focus:ring-pink-500 w-5 h-5">
                                    <span class="font-bold text-gray-900"><i class="far fa-credit-card mr-2"></i> {{ 'CHECKOUT.BILLING.CREDIT_CARD' | translate }}</span>
                                </label>
                                <label class="border border-gray-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-gray-300">
                                    <input type="radio" name="payment" class="text-pink-600 focus:ring-pink-500 w-5 h-5">
                                    <span class="font-bold text-gray-900"><i class="fab fa-paypal mr-2 text-blue-800"></i> {{ 'CHECKOUT.BILLING.PAYPAL' | translate }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Billing Address Form (Mock) -->
                        <div class="space-y-4">
                             <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">{{ 'CHECKOUT.BILLING.ADDRESS' | translate }}</h3>
                             
                             <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'CHECKOUT.BILLING.FULL_NAME' | translate }}</label>
                                <input type="text" [(ngModel)]="guestForm.name" class="w-full border-gray-300 rounded-md shadow-sm p-3 border" placeholder="Full Name">
                             </div>

                             <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <select class="w-full border-gray-300 rounded-md shadow-sm p-3 border bg-white">
                                        <option>Mexico</option>
                                        <option>USA</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <input type="text" class="w-full border-gray-300 rounded-md shadow-sm p-3 border" placeholder="00000">
                                </div>
                             </div>
                             
                             <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                <input type="text" class="w-full border-gray-300 rounded-md shadow-sm p-3 border" placeholder="Street Address">
                             </div>
                        </div>

                        <button (click)="placeOrder()" [disabled]="isProcessing() || !guestForm.name" class="mt-8 w-full py-4 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition disabled:opacity-50 text-lg shadow-lg shadow-pink-200">
                             {{ isProcessing() ? 'Processing Ticket...' : ('CHECKOUT.ORDER_SUMMARY.PLACE_ORDER' | translate) }}
                        </button>
                        
                        <p class="text-center text-xs text-gray-500 mt-4">
                            By clicking "Place Order", you agree to our Terms of Use and Privacy Policy.
                        </p>
                     </div>
                 }
              }

           </div>

           <!-- Sidebar Summary -->
           <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
                  <h3 class="text-xl font-bold text-gray-900 mb-4">{{ 'CHECKOUT.ORDER_SUMMARY.TITLE' | translate }}</h3>
                  
                  <!-- Event Info Snippet -->
                  <div class="mb-6 pb-6 border-b border-gray-100">
                      <h4 class="font-bold text-lg mb-1">{{ cartItems().length ? cartItems()[0].name : 'Event Ticket' }}</h4>
                  </div>

                  <div class="space-y-4 mb-6">
                      <div class="flex justify-between items-center text-sm">
                          <span class="text-gray-600">
                             {{ 'CHECKOUT.ORDER_SUMMARY.QUANTITY' | translate }}: {{ totalCount() }} <br>
                             <!-- Optional: detail about tickets -->
                             @for (item of cartItems(); track item.ticketId) {
                                  <span class="text-xs text-gray-400 block">- {{ item.quantity }}x {{ item.name }}</span>
                             }
                          </span>
                          <span class="font-medium">{{ totalPrice() | currency:currency():'symbol':'1.0-0' }}</span>
                      </div>
                      <div class="flex justify-between items-center text-sm text-green-600">
                          <span>Delivery</span>
                          <span>Free</span>
                      </div>
                      
                      <!-- Promo Code Section -->
                      <div class="py-4 border-t border-gray-100">
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Promo Code</label>
                          <div class="flex gap-2">
                              <input [(ngModel)]="promoCode" [disabled]="isPromoValid()" type="text" placeholder="DISCOUNT20" class="flex-1 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 uppercase">
                              <button (click)="applyPromo()" [disabled]="!promoCode() || isPromoValid()" class="px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-700 transition disabled:opacity-50">
                                  Apply
                              </button>
                          </div>
                          @if(promoMessage()) {
                              <p class="text-xs mt-2 font-bold" [ngClass]="{'text-green-600': isPromoValid(), 'text-red-500': !isPromoValid()}">
                                  {{ promoMessage() }}
                              </p>
                          }
                      </div>

                      <div class="space-y-4 mb-6">
                            @if(discountAmount() > 0) {
                                <div class="flex justify-between items-center text-sm text-pink-600 font-bold">
                                    <span>Discount ({{ appliedPromoCode() }})</span>
                                    <span>-{{ discountAmount() | currency:currency():'symbol':'1.0-2' }}</span>
                                </div>
                            }
                      </div>

                  <div class="flex justify-between items-center text-xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                      <span>{{ 'CHECKOUT.ORDER_SUMMARY.TOTAL' | translate }}</span>
                      <span>{{ totalPrice() | currency:currency():'symbol':'1.0-0' }}</span>
                  </div>

                  <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="flex items-center gap-2 text-pink-600 font-bold mb-2">
                          <i class="fas fa-shield-alt"></i> {{ 'EVENT_DETAIL.BUYER_GUARANTEE' | translate }}
                      </div>
                      <p class="text-xs text-gray-500">
                          Receive full refund if event is cancelled. Tickets are authentic and valid for entry.
                      </p>
                  </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  `,
   styles: [`
    input:focus, select:focus { outline: none; border-color: #db2777; ring: 2px; }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
   step = signal(1);
   timeLeft = signal(600); // 10 minutes in seconds
   timerInterval: any;

   guestForm = { name: '', email: '' }; // name collected in billing
   guestEmailConfirmed = signal(false);

   cartItems = signal<any[]>([]);
   currency = signal('USD');

   // Promo Signals
   promoCode = signal('');
   discountAmount = signal(0);
   appliedPromoCode = signal(''); // The valid code currently applied
   promoMessage = signal('');
   isPromoValid = signal(false);

   // Derived Total
   totalPrice = computed(() => {
      const subtotal = this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return Math.max(0, subtotal - this.discountAmount()); // Ensure not negative
   });

   originalTotal = computed(() => this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0));
   totalCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

   isProcessing = signal(false);

   constructor(
      private orderService: OrderService,
      private promoService: PromoService,
      public authService: AuthService,
      private router: Router
   ) { }

   ngOnInit() {
      this.cartItems.set(this.orderService.getCart());
      this.currency.set(this.orderService.getCurrency());

      // Redirect if empty
      if (this.cartItems().length === 0) {
         this.router.navigate(['/']);
         return;
      }

      this.startTimer();
   }

   ngOnDestroy() {
      if (this.timerInterval) clearInterval(this.timerInterval);
   }

   startTimer() {
      this.timerInterval = setInterval(() => {
         this.timeLeft.update(v => {
            if (v <= 0) {
               clearInterval(this.timerInterval);
               alert('Time expired! Returning to home.');
               this.router.navigate(['/']);
               return 0;
            }
            return v - 1;
         });
      }, 1000);
   }

   formatTime(seconds: number): string {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
   }

   confirmGuest() {
      this.guestEmailConfirmed.set(true);
   }

   login() {
      // Pass returnUrl so successful login routes back to checkout
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
   }

   register() {
      // Pass returnUrl so successful registration routes back to checkout
      this.router.navigate(['/auth/register'], { queryParams: { returnUrl: '/checkout' } });
   }

   nextStep() {
      this.step.update(s => s + 1);
   }

   applyPromo() {
      if (!this.promoCode()) return;

      // Pass eventId check if cart has items (assuming single event cart for now)
      const eventId = this.cartItems()[0]?.eventId; // Assuming cart items have eventId attached, or we fetch it. 
      // Note: Current simple cart might only have ticketId/price/name. 
      // If strict event check needed, we should store eventId in cart. 
      // For MVP, we'll validate without eventId check or rely on backend to check global if null.

      this.promoService.validatePromoCode(this.promoCode(), this.originalTotal(), eventId).subscribe({
         next: (res) => {
            this.discountAmount.set(res.discountAmount);
            this.appliedPromoCode.set(res.code);
            this.isPromoValid.set(true);
            this.promoMessage.set(`code applied! -$${res.discountAmount}`);
         },
         error: (err) => {
            this.discountAmount.set(0);
            this.appliedPromoCode.set('');
            this.isPromoValid.set(false);
            this.promoMessage.set(err.error?.message || 'Invalid code');
         }
      });
   }

   placeOrder() {
      this.isProcessing.set(true);

      const items: OrderItem[] = this.cartItems().map(i => ({
         ticketId: i.ticketId,
         quantity: i.quantity
      }));

      // If auth, guestInfo undefined. If guest, pass name/email
      const guestInfo = !this.authService.isAuthenticated ?
         { name: this.guestForm.name, email: this.guestForm.email } : undefined;

      this.orderService.createOrder(items, guestInfo, this.appliedPromoCode()).subscribe({
         next: (order) => {
            // Success
            this.router.navigate(['/order-confirmation', order.id], {
               state: { total: this.totalPrice() }
            });
         },
         error: (err) => {
            console.error(err);
            alert('Error placing order');
            this.isProcessing.set(false);
         }
      });
   }
}
