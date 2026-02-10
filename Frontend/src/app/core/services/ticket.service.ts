import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ticket } from './event.service';

@Injectable({
    providedIn: 'root'
})
export class TicketService {
    private apiUrl = `${environment.apiUrl}/tickets`;

    constructor(private http: HttpClient) { }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    }

    createTicket(ticketData: any): Observable<Ticket> {
        return this.http.post<Ticket>(this.apiUrl, ticketData, { headers: this.getHeaders() });
    }

    getTicketsByEvent(eventId: number): Observable<Ticket[]> {
        return this.http.get<Ticket[]>(`${this.apiUrl}/event/${eventId}`);
    }

    updateTicket(id: number, ticketData: any): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticketData, { headers: this.getHeaders() });
    }

    deleteTicket(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    getSecureCode(ticketId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/secure-code/${ticketId}`, { headers: this.getHeaders() });
    }

    getAppleWalletUrl(ticketId: number): string {
        return `${this.apiUrl}/${ticketId}/wallet/apple?token=${localStorage.getItem('token')}`;
    }

    getGoogleWalletUrl(ticketId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${ticketId}/wallet/google`, { headers: this.getHeaders() });
    }
}
