import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PromoService {
    private apiUrl = `${environment.apiUrl}/promocodes`;

    constructor(private http: HttpClient) { }

    validatePromoCode(code: string, subtotal: number, eventId?: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/validate`, { code, subtotal, eventId });
    }

    // Admin Methods
    getPromoCodes(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    createPromoCode(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }

    deletePromoCode(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
