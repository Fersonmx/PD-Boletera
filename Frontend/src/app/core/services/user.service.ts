import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserResponse {
    users: any[];
    total: number;
    page: number;
    pages: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getUsers(params: any = {}): Observable<UserResponse> {
        return this.http.get<UserResponse>(this.apiUrl, { params: this.getParams(params), headers: this.getHeaders() });
    }

    getUserById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    createUser(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data, { headers: this.getHeaders() });
    }

    updateUser(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    }

    private getParams(params: any) {
        // Simple pass-through for now, can be extended
        return params;
    }
}
