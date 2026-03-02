import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService, Category, EventTier } from '../../../../core/services/event.service';
import { VenueService, Venue, VenueLayout, VenueSection } from '../../../../core/services/venue.service';
import { TicketService } from '../../../../core/services/ticket.service';
import { CategoryService } from '../../../../core/services/category.service';
import { UploadService } from '../../../../core/services/upload.service';
import { Ticket } from '../../../../core/services/event.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      
      <!-- Event Form Section -->
      <div>
        <div class="md:flex md:items-center md:justify-between mb-8">
          <div class="min-w-0 flex-1">
            <h2 class="text-3xl font-black uppercase tracking-tight text-gray-900">
              {{ isEditMode ? 'Edit Event' : 'Create New Event' }}
            </h2>
            <p class="mt-2 text-sm text-gray-500">Manage event details, dates, and locations.</p>
          </div>
        </div>

        <div class="bg-white shadow-sm border border-gray-100 sm:rounded-2xl overflow-hidden">
          <div class="px-6 py-8 sm:p-10">
            <form class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6" (ngSubmit)="onSubmit()">
              
              <div class="sm:col-span-4">
                <label for="title" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Event Title</label>
                <div class="mt-2">
                  <input [(ngModel)]="formData.title" type="text" name="title" id="title" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base font-medium">
                </div>
              </div>

              <div class="col-span-full">
                <label for="description" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Description</label>
                <div class="mt-2">
                  <textarea [(ngModel)]="formData.description" id="description" name="description" rows="3" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base"></textarea>
                </div>
              </div>

              <div class="sm:col-span-3">
                <label for="date" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Date & Time</label>
                <div class="mt-2">
                  <input [(ngModel)]="formData.date" type="datetime-local" name="date" id="date" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base font-medium">
                </div>
              </div>

              <div class="sm:col-span-3">
                <div class="flex items-center justify-between">
                  <label for="categoryId" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Category</label>
                  <button type="button" (click)="showNewCategoryForm = !showNewCategoryForm" class="text-xs font-bold text-pink-600 hover:text-pink-800 uppercase">+ New Category</button>
                </div>
                <div class="mt-2">
                  <select [(ngModel)]="formData.categoryId" name="categoryId" id="categoryId" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base font-medium">
                    <option [ngValue]="null">Select a Category</option>
                    @for (category of categories(); track category.id) {
                      <option [value]="category.id">{{ category.name }}</option>
                    }
                  </select>
                </div>
                @if (showNewCategoryForm) {
                    <div class="mt-3 flex items-center gap-2 p-3 bg-pink-50 rounded-xl border border-pink-100">
                        <input [(ngModel)]="newCategoryName" name="newCategoryName" placeholder="Category Name" class="block w-full rounded-lg border-gray-300 py-2 text-sm focus:ring-pink-500 focus:border-pink-500">
                        <button type="button" (click)="createCategory()" class="bg-pink-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-pink-700 whitespace-nowrap shadow-sm">Save</button>
                    </div>
                }
              </div>

              <div class="sm:col-span-3">
                <label for="venueId" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Venue</label>
                <div class="mt-2">
                  <select [(ngModel)]="formData.venueId" (change)="onVenueChange()" name="venueId" id="venueId" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base font-medium">
                    <option [ngValue]="null">Select a Venue</option>
                    @for (venue of venues(); track venue.id) {
                      <option [value]="venue.id">{{ venue.name }} ({{ venue.city }})</option>
                    }
                  </select>
                </div>
              </div>

               <div class="sm:col-span-3">
                <label for="layoutId" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Seating Layout</label>
                <div class="mt-2">
                  <select [(ngModel)]="formData.layoutId" (change)="onLayoutChange()" name="layoutId" id="layoutId" [disabled]="!formData.venueId || availableLayouts().length === 0" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base font-medium disabled:bg-gray-100 disabled:text-gray-400">
                    <option [ngValue]="null">Select Layout</option>
                    @for (layout of availableLayouts(); track layout.id) {
                      <option [value]="layout.id">{{ layout.name }}</option>
                    }
                  </select>
                  @if (formData.venueId && availableLayouts().length === 0) {
                      <p class="mt-1 text-xs text-red-500">No layouts found for this venue.</p>
                  }
                </div>
              </div>
              
              <!-- Ticket Pricing Configurator (Create Mode & Edit Mode) -->
              @if (selectedLayoutSections().length > 0) {
                  <div class="col-span-full bg-pink-50 rounded-xl p-6 border border-pink-100">
                      <div class="flex items-center justify-between mb-4">
                          <div>
                              <h3 class="text-sm font-bold text-pink-800 uppercase">Ticket Pricing Configuration</h3>
                              <p class="text-xs text-pink-600">Set prices for each section. Tickets will be automatically generated.</p>
                          </div>
                          
                          <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-pink-200 shadow-sm hover:bg-pink-50 transition">
                            <span class="text-xs font-bold text-pink-700 uppercase">Enable Phases/Tiers</span>
                            <input type="checkbox" [(ngModel)]="enableTiers" name="enableTiers" class="accent-pink-600 w-4 h-4 rounded">
                          </label>
                      </div>
                      
                      @if (!enableTiers) {
                          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              @for (section of selectedLayoutSections(); track section.id) {
                                  <div class="bg-white p-3 rounded-lg shadow-sm border border-pink-100">
                                      <label class="block text-xs font-bold text-gray-700 uppercase mb-1">{{ section.name }}</label>
                                      <p class="text-xs text-gray-400 mb-2">Capacity: {{ section.capacity }}</p>
                                      <div class="relative rounded-md shadow-sm">
                                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                          <span class="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input type="number" [(ngModel)]="sectionPrices[section.id!]" [name]="'price-' + section.id" class="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6" placeholder="0.00">
                                      </div>
                                  </div>
                              }
                          </div>
                      } @else {
                          <!-- Tiers Interface -->
                          <div class="space-y-6">
                             <!-- 1. Define Phases -->
                             <div class="space-y-3">
                                 @for (tier of tiers; track $index) {
                                     <div class="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-xl border border-pink-200 shadow-sm relative group">
                                         <div class="w-full sm:flex-1">
                                             <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Phase Name</label>
                                             <input [(ngModel)]="tier.name" [name]="'tier-name-'+$index" placeholder="e.g. Early Bird" class="block w-full rounded-lg border-gray-300 text-sm focus:ring-pink-500 focus:border-pink-500">
                                         </div>
                                         <div class="w-full sm:flex-1">
                                             <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                                             <input type="datetime-local" [(ngModel)]="tier.startDate" [name]="'tier-start-'+$index" class="block w-full rounded-lg border-gray-300 text-sm focus:ring-pink-500 focus:border-pink-500">
                                         </div>
                                         <div class="w-full sm:flex-1">
                                             <label class="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                                             <input type="datetime-local" [(ngModel)]="tier.endDate" [name]="'tier-end-'+$index" class="block w-full rounded-lg border-gray-300 text-sm focus:ring-pink-500 focus:border-pink-500">
                                         </div>
                                         
                                         @if (tiers.length > 1) {
                                             <button type="button" (click)="removeTier($index)" class="absolute top-2 right-2 sm:static sm:mb-2 text-gray-400 hover:text-red-500 transition-colors">
                                                 <i class="fas fa-trash"></i>
                                             </button>
                                         }
                                     </div>
                                 }
                                 <button type="button" (click)="addTier()" class="text-xs font-bold uppercase tracking-wider text-pink-600 hover:text-pink-800 flex items-center gap-2 px-2">
                                     <i class="fas fa-plus-circle"></i> Add Phase
                                 </button>
                             </div>

                             <!-- 2. Define Prices per Phase -->
                             <div class="bg-white/50 rounded-xl p-4 border border-pink-100">
                                 <h4 class="text-xs font-black uppercase text-pink-900 mb-4 tracking-wide">Pricing by Phase</h4>
                                 <div class="space-y-6">
                                     @for (tier of tiers; track $index; let tierIndex = $index) {
                                         <div>
                                             <div class="flex items-center gap-2 mb-2">
                                                 <div class="h-2 w-2 rounded-full bg-pink-500"></div>
                                                 <h5 class="font-bold text-xs uppercase text-gray-700">{{ tier.name || 'Phase ' + (tierIndex + 1) }}</h5>
                                             </div>
                                             <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                 @for (section of selectedLayoutSections(); track section.id) {
                                                     <div class="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500 relative group">
                                                         <label class="block text-[10px] font-bold uppercase text-gray-500 mb-1 truncate">{{ section.name }}</label>
                                                         
                                                         <!-- Price Input -->
                                                         <div class="relative mb-1">
                                                             <span class="absolute left-2 top-1.5 text-xs text-gray-400">$</span>
                                                             <input type="number" [(ngModel)]="tierPrices[tierIndex][section.id!]" [name]="'price-' + tierIndex + '-' + section.id" class="block w-full border border-gray-100 rounded p-1 pl-5 text-sm font-bold text-gray-900 placeholder-gray-300 focus:ring-0 focus:border-pink-500" placeholder="Price">
                                                         </div>
                                                         
                                                         <!-- Limit Input -->
                                                         <div class="flex items-center gap-1">
                                                             <div class="relative flex-1">
                                                                 <span class="absolute left-2 top-1.5 text-[10px] text-gray-400">#</span>
                                                                 <input type="number" 
                                                                        [(ngModel)]="tierLimits[tierIndex][section.id!]" 
                                                                        [name]="'limit-' + tierIndex + '-' + section.id" 
                                                                        [placeholder]="'Max (' + section.capacity + ')'"
                                                                        [disabled]="tierLimits[tierIndex][section.id!] === null"
                                                                        class="block w-full border border-gray-100 rounded p-1 pl-5 text-xs text-gray-700 placeholder-gray-300 disabled:bg-gray-50 disabled:text-gray-400 focus:ring-0 focus:border-pink-500">
                                                             </div>
                                                             <button type="button" 
                                                                     (click)="tierLimits[tierIndex][section.id!] = (tierLimits[tierIndex][section.id!] === null ? 0 : null)"
                                                                     class="p-1 rounded text-[10px] font-bold uppercase border transition-colors"
                                                                     [class.bg-pink-100]="tierLimits[tierIndex][section.id!] === null"
                                                                     [class.text-pink-600]="tierLimits[tierIndex][section.id!] === null"
                                                                     [class.border-pink-200]="tierLimits[tierIndex][section.id!] === null"
                                                                     [class.bg-gray-50]="tierLimits[tierIndex][section.id!] !== null"
                                                                     [class.text-gray-400]="tierLimits[tierIndex][section.id!] !== null"
                                                                     [class.border-gray-200]="tierLimits[tierIndex][section.id!] !== null"
                                                                     title="Toggle Unlimited/Max Capacity">
                                                                     {{ tierLimits[tierIndex][section.id!] === null ? '∞' : 'Lim' }}
                                                             </button>
                                                         </div>
                                                     </div>
                                                 }
                                             </div>
                                         </div>
                                     }
                                 </div>
                             </div>
                          </div>
                      }
                  </div>
              }

               <div class="sm:col-span-3">
                <label for="status" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Status</label>
                <div class="mt-2">
                  <select [(ngModel)]="formData.status" name="status" id="status" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base font-medium">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div class="col-span-full bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                           <i class="fas fa-qrcode text-xl"></i>
                        </div>
                        <div>
                           <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Dynamic Security QR</h3>
                           <p class="text-xs text-gray-500">Prevent screenshots and fraud with rotating codes.</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="formData.isDynamicQr" name="isDynamicQr" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                  </div>

                  @if (formData.isDynamicQr) {
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 animate-fadeIn">
                          <div>
                              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Activation Window (Minutes)</label>
                              <p class="text-xs text-gray-400 mb-2">How long before the event should the QR be visible?</p>
                              <div class="relative">
                                  <input type="number" [(ngModel)]="formData.dynamicQrWindow" name="dynamicQrWindow" class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pl-3 pr-12" placeholder="120">
                                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-xs font-bold">MIN</div>
                              </div>
                          </div>
                      </div>
                  }
              </div>

              <div class="col-span-full bg-indigo-50 p-6 rounded-xl border border-indigo-100 mt-4">
                  <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                           <i class="fas fa-map text-xl"></i>
                        </div>
                        <div>
                           <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Show Interactive Map</h3>
                           <p class="text-xs text-gray-500">Allow users to view and interact with the venue layout map.</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="formData.showMap" name="showMap" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                  </div>
              </div>

              <div class="sm:col-span-3">
                <label for="currency" class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Currency</label>
                <div class="mt-2">
                  <select [(ngModel)]="formData.currency" name="currency" id="currency" class="block w-full rounded-xl border-gray-300 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm md:text-base font-medium">
                    <option value="USD">USD ($)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              

              <div class="col-span-full">
                <label class="block text-sm font-bold leading-6 text-gray-900 uppercase tracking-wide">Event Image</label>
                <div class="mt-2 flex items-center gap-x-6">
                    <div class="relative h-40 w-full sm:w-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                        @if (previewImage || formData.imageUrl) {
                            <img [src]="previewImage || getImageUrl(formData.imageUrl)" alt="Event Cover" class="h-full w-full object-cover">
                            <button type="button" (click)="removeImage()" class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        } @else {
                            <div class="text-center text-gray-400">
                                <i class="fas fa-image text-3xl mb-2"></i>
                                <span class="block text-xs uppercase font-bold">No Image</span>
                            </div>
                        }
                        
                         <!-- Loading Overlay -->
                         @if (isUploading) {
                            <div class="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                            </div>
                         }
                    </div>
                    
                    <div>
                         <label for="file-upload" class="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-bold uppercase tracking-wide text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
                            <span>Change Image</span>
                            <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/*" (change)="onFileSelected($event)">
                        </label>
                        <p class="mt-2 text-xs leading-5 text-gray-500">JPG, PNG, GIF up to 5MB</p>
                    </div>
                </div>
              </div>

              <div class="col-span-full pt-6 border-t border-gray-100 flex items-center justify-end gap-x-4">
                <button type="button" class="text-sm font-bold leading-6 text-gray-500 uppercase tracking-wider hover:text-gray-900 px-4 py-2" (click)="cancel()">Cancel</button>
                <button type="submit" class="rounded-xl bg-pink-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:bg-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 transition-all hover:-translate-y-0.5 shadow-pink-200">
                  {{ isEditMode ? 'Update Event' : 'Create Event' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Ticket Management Section (Edit Mode Only - for manual adjustments) -->
      @if (isEditMode) {
        <div class="bg-white shadow-sm border border-gray-100 sm:rounded-2xl p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold leading-6 text-gray-900 uppercase tracking-tight">Tickets</h3>
            <button (click)="showTicketForm = true" class="text-xs font-bold uppercase tracking-wider bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-md">Add Manual Ticket</button>
          </div>

          <!-- Create Ticket Form -->
          @if (showTicketForm) {
            <div class="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200 shadow-inner">
              <h4 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">New Ticket Type</h4>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-5 items-end">
                <div class="space-y-1">
                   <label class="text-[10px] font-bold text-gray-500 uppercase">Map Section</label>
                   <select [(ngModel)]="newTicket.sectionId" (change)="onTicketSectionChange()" class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                     <option [ngValue]="null">General</option>
                     @for (section of selectedLayoutSections(); track section.id) {
                       <option [value]="section.id">{{ section.name }}</option>
                     }
                   </select>
                </div>
                <div class="space-y-1">
                   <label class="text-[10px] font-bold text-gray-500 uppercase">Name</label>
                   <input [(ngModel)]="newTicket.name" placeholder="e.g. VIP" class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                </div>
                <div class="space-y-1">
                   <label class="text-[10px] font-bold text-gray-500 uppercase">Price</label>
                   <input [(ngModel)]="newTicket.price" type="number" placeholder="0.00" class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                </div>
                <div class="space-y-1">
                   <label class="text-[10px] font-bold text-gray-500 uppercase">Qty</label>
                   <input [(ngModel)]="newTicket.quantity" type="number" placeholder="100" class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                </div>
                <div class="flex items-center gap-2 pb-0.5">
                  <button (click)="addTicket()" class="bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 text-xs font-bold uppercase tracking-wide shadow-md w-full sm:w-auto">Save</button>
                  <button (click)="showTicketForm = false" class="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-xs font-bold uppercase tracking-wide shadow-sm w-full sm:w-auto">Cancel</button>
                </div>
              </div>
            </div>
          }

          <!-- Ticket List -->
          <ul role="list" class="divide-y divide-gray-100">
            @for (ticket of tickets(); track ticket.id) {
              <li class="flex justify-between gap-x-6 py-5 hover:bg-gray-50 transition-colors px-4 rounded-lg -mx-4">
                <div class="flex min-w-0 gap-x-4">
                  <div class="min-w-0 flex-auto">
                    <p class="text-sm font-black text-gray-900 uppercase tracking-wide">{{ ticket.name }}</p>
                    <p class="mt-1 truncate text-xs font-medium text-gray-500">\${{ ticket.price }} • <span class="text-pink-600">{{ ticket.available }} available</span> / {{ ticket.quantity }} total</p>
                  </div>
                </div>
                <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                  <button (click)="deleteTicket(ticket.id)" class="text-gray-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider transition-colors">Delete</button>
                </div>
              </li>
            }
            @if (tickets().length === 0) {
              <li class="py-8 text-center text-gray-400 text-sm italic">No tickets created for this event yet.</li>
            }
          </ul>
        </div>
      }

    </div>
  `
})
export class EventFormComponent implements OnInit {
  isEditMode = false;
  eventId: number | null = null;
  isUploading = false;

  formData: any = {
    title: '',
    description: '',
    date: '',
    venueId: null,
    layoutId: null,
    categoryId: null,
    imageUrl: '',
    status: 'published',
    currency: 'USD',
    showMap: true
  };

  rawEventData: any = null;

  // Catalogs
  categories = signal<Category[]>([]);
  venues = signal<Venue[]>([]);

  // Layout Management
  availableLayouts = signal<VenueLayout[]>([]);
  selectedLayoutSections = signal<VenueSection[]>([]);

  // Pricing State
  // sectionPrices: { [sectionId]: price } (Standard)
  sectionPrices: { [key: number]: number } = {};

  // Tiers State
  enableTiers = false;
  tiers: EventTier[] = [{ name: 'Phase 1', startDate: '', endDate: '' }];
  // tierPrices: { [tierIndex]: { [sectionId]: price } }
  tierPrices: { [key: number]: { [key: number]: number } } = { 0: {} };
  // tierLimits: { [tierIndex]: { [sectionId]: limit (number or null for unlimited) } }
  tierLimits: { [key: number]: { [key: number]: number | null } } = { 0: {} };

  // Category Management
  showNewCategoryForm = false;
  newCategoryName = '';

  // Ticket Management
  tickets = signal<Ticket[]>([]);
  showTicketForm = false;
  newTicket: any = { name: '', price: 0, quantity: 100, sectionId: null };

  previewImage: string | null = null;

  constructor(
    private eventService: EventService,
    private ticketService: TicketService,
    private categoryService: CategoryService,
    private venueService: VenueService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.categoryService.getCategories().subscribe(data => this.categories.set(data));
    this.venueService.getVenues().subscribe(data => {
      this.venues.set(data);
      if (this.isEditMode && this.formData.venueId) {
        this.updateAvailableLayouts(this.formData.venueId);
        if (this.formData.layoutId) {
          this.onLayoutChange();
          if (this.rawEventData) {
            this.populatePricingFromEvent();
          }
        }
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.eventId = +id;
        this.loadEventData(this.eventId);
      }
    });
  }

  loadEventData(id: number) {
    this.eventService.getEventById(id).subscribe(event => {
      this.formData = { ...event };

      this.rawEventData = event;
      if (event.Venue) {
        this.formData.venueId = event.Venue.id;
        delete this.formData.Venue;
        // Populate layouts if venues are already loaded
        if (this.venues().length > 0) {
          this.updateAvailableLayouts(this.formData.venueId);
          if (this.formData.layoutId) {
            this.onLayoutChange();
            this.populatePricingFromEvent();
          }
        }
      }
      if (event.Category) {
        this.formData.categoryId = event.Category.id;
        delete this.formData.Category;
      }

      // Cleanup
      if (this.formData.Venue) delete this.formData.Venue;
      if (this.formData.Tickets) delete this.formData.Tickets;
      if (this.formData.id) delete this.formData.id;
      if (this.formData.createdAt) delete this.formData.createdAt;
      if (this.formData.updatedAt) delete this.formData.updatedAt;

      if (this.formData.date) {
        this.formData.date = new Date(this.formData.date).toISOString().slice(0, 16);
      }
    });
    this.loadTickets(id);
  }

  loadTickets(eventId: number) {
    this.ticketService.getTicketsByEvent(eventId).subscribe(data => {
      this.tickets.set(data);
    });
  }

  onVenueChange() {
    this.formData.layoutId = null;
    this.selectedLayoutSections.set([]);
    this.updateAvailableLayouts(this.formData.venueId);
  }

  updateAvailableLayouts(venueId: number) {
    const venue = this.venues().find(v => v.id == venueId);
    if (venue && venue.layouts) {
      this.availableLayouts.set(venue.layouts);
    } else {
      this.availableLayouts.set([]);
    }
  }

  onLayoutChange() {
    const layout = this.availableLayouts().find(l => l.id == this.formData.layoutId);
    if (layout && layout.sections) {
      this.selectedLayoutSections.set(layout.sections);

      // Initialize Standard Prices
      this.sectionPrices = {};
      layout.sections.forEach(s => {
        if (s.id) this.sectionPrices[s.id] = 0;
      });

      // Initialize Tier Prices
      this.initializeTierPrices();
    } else {
      this.selectedLayoutSections.set([]);
    }
  }

  initializeTierPrices() {
    this.tiers.forEach((_, index) => {
      if (!this.tierPrices[index]) this.tierPrices[index] = {};
      if (!this.tierLimits[index]) this.tierLimits[index] = {};

      this.selectedLayoutSections().forEach(s => {
        if (s.id && !this.tierPrices[index][s.id]) {
          this.tierPrices[index][s.id] = 0;
        }
        if (s.id && this.tierLimits[index][s.id] === undefined) {
          this.tierLimits[index][s.id] = null; // Default to 'unlimited'
        }
      });
    });
  }

  addTier() {
    this.tiers.push({ name: `Phase ${this.tiers.length + 1}`, startDate: '', endDate: '' });
    this.initializeTierPrices();
  }

  removeTier(index: number) {
    if (this.tiers.length > 1) {
      this.tiers.splice(index, 1);
      delete this.tierPrices[index];
      delete this.tierLimits[index];

      const newPrices: any = {};
      const newLimits: any = {};
      this.tiers.forEach((_, i) => {
        newPrices[i] = {};
        newLimits[i] = {};
        this.selectedLayoutSections().forEach(s => {
          newPrices[i][s.id!] = 0;
          newLimits[i][s.id!] = null;
        });
      });
      this.tierPrices = newPrices;
      this.tierLimits = newLimits;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);

      this.isUploading = true;
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          this.formData.imageUrl = response.filePath;
          this.isUploading = false;
        },
        error: (err) => {
          console.error(err);
          alert('Upload failed');
          this.isUploading = false;
        }
      });
    }
  }

  populatePricingFromEvent() {
    if (!this.rawEventData) return;
    const event = this.rawEventData;

    if (event.tiers && event.tiers.length > 0) {
      this.enableTiers = true;
      this.tiers = event.tiers.map((t: any) => ({
        id: t.id,
        name: t.name,
        startDate: t.startDate ? new Date(t.startDate).toISOString().slice(0, 16) : '',
        endDate: t.endDate ? new Date(t.endDate).toISOString().slice(0, 16) : ''
      }));

      this.tierPrices = {};
      this.tierLimits = {};

      this.tiers.forEach((tier, index) => {
        this.tierPrices[index] = {};
        this.tierLimits[index] = {};

        // default
        this.selectedLayoutSections().forEach(s => {
          this.tierPrices[index][s.id!] = 0;
          this.tierLimits[index][s.id!] = null;
        });

        if (event.Tickets) {
          const tierTickets = event.Tickets.filter((t: any) => t.tierId === tier.id);
          tierTickets.forEach((ticket: any) => {
            this.tierPrices[index][ticket.sectionId!] = ticket.price;
            const section = this.selectedLayoutSections().find(s => s.id === ticket.sectionId);
            if (section && ticket.quantity < section.capacity) {
              this.tierLimits[index][ticket.sectionId!] = ticket.quantity;
            } else {
              this.tierLimits[index][ticket.sectionId!] = null;
            }
          });
        }
      });
    } else if (event.Tickets && event.Tickets.length > 0) {
      this.enableTiers = false;
      if (!this.sectionPrices) this.sectionPrices = {};
      event.Tickets.forEach((ticket: any) => {
        if (ticket.sectionId && !ticket.tierId) {
          this.sectionPrices[ticket.sectionId] = ticket.price;
        }
      });
    }
  }

  removeImage() {
    this.formData.imageUrl = '';
    this.previewImage = null;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Auto-fix old database paths to ensure Nginx proxies them to Node
    if (path.startsWith('/uploads')) {
        path = '/api' + path;
    }
    
    const baseUrl = environment.apiUrl.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  onSubmit() {
    // Validations
    if (!this.formData.title || !this.formData.title.trim()) {
      alert('Event Title is required.');
      return;
    }

    if (!this.formData.date) {
      alert('You must enter a valid Date & Time for this event.');
      return;
    }

    if (!this.formData.venueId) {
      alert('You must select a Venue for this event.');
      return;
    }

    if (!this.formData.layoutId) {
      alert('You must select a Layout to configure spaces and tickets.');
      return;
    }

    // Construct Payload
    const payload: any = { ...this.formData };

    // Add ticket configs if using sections (both Create and Edit mode)
    if (this.formData.layoutId && this.selectedLayoutSections().length > 0) {

      if (this.enableTiers) {
        payload.tiers = this.tiers.map((tier, index) => {
          const configs: any = {};
          this.selectedLayoutSections().forEach(s => {
            if (s.id) {
              configs[s.id] = {
                price: this.tierPrices[index][s.id],
                quantity: this.tierLimits[index][s.id] // null means unlimited/max
              };
            }
          });
          return { ...tier, configs };
        });
      } else {
        payload.ticketConfigs = this.selectedLayoutSections().map(s => ({
          sectionId: s.id,
          price: this.sectionPrices[s.id!] || 0
        }));
      }
    }

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, payload).subscribe({
        next: () => {
          alert('Event updated successfully!');
        },
        error: (err) => alert('Error updating: ' + err.error.message)
      });
    } else {
      this.eventService.createEvent(payload).subscribe({
        next: (event) => {
          alert('Event created! Tickets generated.');
          this.router.navigate(['/admin/events']); // Go list or stay? List is fine.
        },
        error: (err) => alert('Error creating: ' + err.error.message)
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/events']);
  }

  addTicket() {
    if (!this.eventId) return;

    if (!this.newTicket.name || !this.newTicket.name.trim()) {
      alert('Please enter a ticket name');
      return;
    }

    const ticketPayload = { ...this.newTicket, eventId: this.eventId };
    this.ticketService.createTicket(ticketPayload).subscribe({
      next: () => {
        this.showTicketForm = false;
        this.newTicket = { name: '', price: 0, quantity: 100, sectionId: null };
        this.loadTickets(this.eventId!);
      },
      error: (err) => alert('Failed to create ticket: ' + err.error?.message)
    });
  }

  onTicketSectionChange() {
    if (this.newTicket.sectionId) {
      const section = this.selectedLayoutSections().find(s => s.id == this.newTicket.sectionId);
      if (section) {
        this.newTicket.name = section.name;
        this.newTicket.quantity = section.capacity;
      }
    }
  }

  deleteTicket(ticketId: number) {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketService.deleteTicket(ticketId).subscribe({
        next: () => this.loadTickets(this.eventId!),
        error: (err) => alert('Failed to delete ticket')
      });
    }
  }

  createCategory() {
    if (!this.newCategoryName || !this.newCategoryName.trim()) return;
    const payload = {
      name: this.newCategoryName,
      slug: this.newCategoryName.toLowerCase().replace(/\s+/g, '-')
    };

    this.categoryService.createCategory(payload).subscribe({
      next: (newCat) => {
        // Update local list
        this.categories.update(cats => [...cats, newCat]);
        // Auto-select and hide form
        this.formData.categoryId = newCat.id;
        this.newCategoryName = '';
        this.showNewCategoryForm = false;
      },
      error: (err) => alert('Failed to create category: ' + (err.error?.message || err.message))
    });
  }
}
