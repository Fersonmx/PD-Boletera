import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
    ticketId: number;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    // Simple state to hold cart items between pages
    private _cartItems: { ticketId: number; name: string; price: number; quantity: number }[] = [];
    private _currency = 'USD';

    constructor(private http: HttpClient) { }

    setCart(items: { ticketId: number; name: string; price: number; quantity: number }[], currency: string = 'USD') {
        this._cartItems = items;
        this._currency = currency;
    }

    getCart() {
        return this._cartItems;
    }

    getCurrency() {
        return this._currency;
    }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    }

    createOrder(items: OrderItem[], guestInfo?: { name: string, email: string }, promoCode?: string): Observable<any> {
        return this.http.post(`${this.apiUrl}`, { items, guestInfo, promoCode }, {
            headers: this.getHeaders()
        });
    }

    getMyOrders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/myorders`, { headers: this.getHeaders() });
    }

    // Admin Only
    getOrders(params: any = {}): Observable<OrderResponse> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<OrderResponse>(this.apiUrl, { headers, params });
    }
}

export interface OrderResponse {
    orders: any[];
    total: number;
    page: number;
    pages: number;
}
