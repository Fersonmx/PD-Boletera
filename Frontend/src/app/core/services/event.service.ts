import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Venue {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
}

import { VenueLayout } from './venue.service';

export interface Ticket {
    id: number;
    name: string;
    price: number;
    quantity: number;
    available: number;
    sectionId?: number;
    tierId?: number;
}

export interface EventTier {
    id?: number;
    name: string;
    startDate: string | Date;
    endDate: string | Date;
    isActive?: boolean;
}

export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    imageUrl?: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    venueId?: number;
    layoutId?: number;
    Venue?: Venue;
    Category?: Category;
    Tickets?: Ticket[];
    VenueLayout?: VenueLayout;
    currency?: string;
    showMap?: boolean;
    tiers?: EventTier[];
}

export interface EventResponse {
    events: Event[];
    total: number;
    page: number;
    pages: number;
}

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private apiUrl = `${environment.apiUrl}/events`;

    constructor(private http: HttpClient) { }

    getEvents(params: any = {}): Observable<EventResponse> {
        return this.http.get<EventResponse>(this.apiUrl, { params });
    }

    getEventById(id: number): Observable<Event> {
        return this.http.get<Event>(`${this.apiUrl}/${id}`);
    }

    createEvent(eventData: any): Observable<Event> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post<Event>(this.apiUrl, eventData, { headers });
    }

    updateEvent(id: number, eventData: any): Observable<Event> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.put<Event>(`${this.apiUrl}/${id}`, eventData, { headers });
    }

    deleteEvent(id: number): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }
}
