import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VenueService, Venue } from '../../../../core/services/venue.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-venues-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="px-0 sm:px-0 lg:px-0">
      <div class="sm:flex sm:items-center justify-between mb-8">
        <div class="sm:flex-auto">
          <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tight">{{ 'ADMIN.VENUES_LIST.TITLE' | translate }}</h1>
          <p class="mt-2 text-sm text-gray-500">Manage your event locations and seating charts.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <a routerLink="/admin/venues/new" class="block rounded-lg bg-pink-600 px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all hover:-translate-y-0.5">
            {{ 'ADMIN.VENUES_LIST.BTN_CREATE' | translate }}
          </a>
        </div>
      </div>
      
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-2xl bg-white border border-gray-100">
              <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-4 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 sm:pl-6">{{ 'ADMIN.VENUES_LIST.TH_VENUE' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.VENUES_LIST.TH_CITY' | translate }}</th>
                    <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.VENUES_LIST.TH_CAPACITY' | translate }}</th>
                     <th scope="col" class="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Layouts</th>
                    <th scope="col" class="px-3 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ 'ADMIN.VENUES_LIST.TH_ACTION' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  @for (venue of venues(); track venue.id) {
                    <tr class="hover:bg-pink-50/20 transition-colors group">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-black text-gray-900 sm:pl-6">{{ venue.name }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div class="font-medium text-gray-900">{{ venue.city }}</div>
                        <div class="text-xs text-gray-400">{{ venue.address }}</div>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">{{ venue.capacity | number }}</td>
                       <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span class="inline-flex items-center justify-center px-2 py-1 rounded-md bg-gray-100 text-xs font-bold text-gray-600">
                            {{ venue.layouts?.length || 0 }} Layouts
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                        <a [routerLink]="['/admin/venues/edit', venue.id]" class="text-pink-600 hover:text-pink-900 mr-4 font-bold uppercase text-xs tracking-wider">{{ 'ADMIN.VENUES_LIST.BTN_EDIT' | translate }}</a>
                        <button (click)="deleteVenue(venue.id)" class="text-gray-400 hover:text-red-600 font-bold uppercase text-xs tracking-wider transition-colors">{{ 'ADMIN.VENUES_LIST.BTN_DELETE' | translate }}</button>
                      </td>
                    </tr>
                  }
                  @if (venues().length === 0) {
                     <tr>
                        <td colspan="5" class="text-center py-12 text-gray-400 italic">{{ 'ADMIN.VENUES_LIST.EMPTY' | translate }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VenuesListComponent implements OnInit {
  venues = signal<Venue[]>([]);

  constructor(private venueService: VenueService) { }

  ngOnInit() {
    this.loadVenues();
  }

  loadVenues() {
    this.venueService.getVenues().subscribe({
      next: (data) => this.venues.set(data),
      error: (err) => console.error(err)
    });
  }

  deleteVenue(id: number) {
    if (confirm('Are you sure you want to delete this venue?')) {
      this.venueService.deleteVenue(id).subscribe({
        next: () => this.loadVenues(),
        error: (err) => alert('Error deleting venue')
      });
    }
  }
}
