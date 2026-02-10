import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/categories`;

    constructor(private http: HttpClient) { }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.apiUrl);
    }

    createCategory(categoryData: any): Observable<Category> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post<Category>(this.apiUrl, categoryData, { headers });
    }

    updateCategory(id: number, categoryData: any): Observable<Category> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.put<Category>(`${this.apiUrl}/${id}`, categoryData, { headers });
    }

    deleteCategory(id: number): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }
}
