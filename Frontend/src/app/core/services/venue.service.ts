import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VenueSection {
    id?: number;
    name: string;
    capacity: number;
    visualData?: any;
    layoutId?: number;
}

export interface VenueLayout {
    id?: number;
    name: string;
    imageUrl?: string;
    sections?: VenueSection[];
}

export interface Venue {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    layouts?: VenueLayout[];
}

@Injectable({
    providedIn: 'root'
})
export class VenueService {
    private apiUrl = `${environment.apiUrl}/venues`;

    constructor(private http: HttpClient) { }

    getVenues(): Observable<Venue[]> {
        return this.http.get<Venue[]>(this.apiUrl);
    }

    getVenueById(id: number): Observable<Venue> {
        return this.http.get<Venue>(`${this.apiUrl}/${id}`);
    }

    createVenue(venueData: any): Observable<Venue> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post<Venue>(this.apiUrl, venueData, { headers });
    }

    updateVenue(id: number, venueData: any): Observable<Venue> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.put<Venue>(`${this.apiUrl}/${id}`, venueData, { headers });
    }

    deleteVenue(id: number): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }
}
