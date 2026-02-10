import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromoService } from '../../../../core/services/promo.service';

@Component({
    selector: 'app-promo-codes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
           <h1 class="text-2xl font-bold text-gray-900">Promo Codes</h1>
           <p class="text-gray-500 text-sm">Manage discounts and coupons</p>
        </div>
        <button (click)="showForm = true" class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition flex items-center gap-2">
           <i class="fas fa-plus"></i> New Code
        </button>
      </div>

      <!-- Create Form -->
      @if(showForm) {
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fadeIn">
              <h3 class="text-lg font-bold mb-4">Create Promo Code</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Code</label>
                      <input [(ngModel)]="newPromo.code" placeholder="SUMMER2024" class="w-full border-gray-300 rounded-lg uppercase">
                  </div>
                  <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                      <select [(ngModel)]="newPromo.discountType" class="w-full border-gray-300 rounded-lg">
                          <option value="fixed">Fixed Amount ($)</option>
                          <option value="percentage">Percentage (%)</option>
                      </select>
                  </div>
                  <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Value</label>
                      <input [(ngModel)]="newPromo.discountValue" type="number" placeholder="10" class="w-full border-gray-300 rounded-lg">
                  </div>
                   <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Limit (Optional)</label>
                      <input [(ngModel)]="newPromo.usageLimit" type="number" placeholder="Unlimited" class="w-full border-gray-300 rounded-lg">
                  </div>
              </div>
              <div class="flex justify-end gap-2 mt-4">
                  <button (click)="cancelCreate()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button (click)="createCode()" [disabled]="!newPromo.code || !newPromo.discountValue" class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">Save</button>
              </div>
          </div>
      }

      <!-- List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                  <thead class="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                      <tr>
                          <th class="px-6 py-3">Code</th>
                          <th class="px-6 py-3">Discount</th>
                          <th class="px-6 py-3">Usage</th>
                          <th class="px-6 py-3">Status</th>
                          <th class="px-6 py-3 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                      @for (promo of promoCodes(); track promo.id) {
                          <tr class="hover:bg-gray-50">
                              <td class="px-6 py-4 font-bold text-gray-900">{{ promo.code }}</td>
                              <td class="px-6 py-4">
                                  @if(promo.discountType === 'percentage') {
                                      {{ promo.discountValue }}% OFF
                                  } @else {
                                      \${{ promo.discountValue }} OFF
                                  }
                              </td>
                              <td class="px-6 py-4">
                                  {{ promo.usedCount }} / {{ promo.usageLimit || '∞' }}
                              </td>
                               <td class="px-6 py-4">
                                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Active</span>
                              </td>
                              <td class="px-6 py-4 text-right">
                                  <button (click)="deleteCode(promo.id)" class="text-red-600 hover:text-red-900 font-bold text-xs uppercase">Delete</button>
                              </td>
                          </tr>
                      }
                      @if (promoCodes().length === 0) {
                          <tr>
                              <td colspan="5" class="px-6 py-8 text-center text-gray-400 italic">No promo codes found</td>
                          </tr>
                      }
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  `
})
export class PromoCodesComponent implements OnInit {
    promoCodes = signal<any[]>([]);
    showForm = false;

    newPromo = {
        code: '',
        discountType: 'fixed',
        discountValue: 0,
        usageLimit: null,
        validUntil: null
    };

    constructor(private promoService: PromoService) { }

    ngOnInit() {
        this.loadCodes();
    }

    loadCodes() {
        this.promoService.getPromoCodes().subscribe((data) => {
            this.promoCodes.set(data);
        });
    }

    createCode() {
        this.promoService.createPromoCode(this.newPromo).subscribe({
            next: (res) => {
                this.loadCodes();
                this.cancelCreate();
            },
            error: (err) => alert('Failed to create code')
        });
    }

    deleteCode(id: number) {
        if (confirm('Are you sure?')) {
            this.promoService.deletePromoCode(id).subscribe(() => this.loadCodes());
        }
    }

    cancelCreate() {
        this.showForm = false;
        this.newPromo = { code: '', discountType: 'fixed', discountValue: 0, usageLimit: null, validUntil: null };
    }
}
