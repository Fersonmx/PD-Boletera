import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    private apiUrl = `${environment.apiUrl}/content`;

    constructor(private http: HttpClient) { }

    // --- Hero Slides ---
    getHeroSlides(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/slides`);
    }

    createHeroSlide(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/slides`, data);
    }

    updateHeroSlide(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/slides/${id}`, data);
    }

    deleteHeroSlide(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/slides/${id}`);
    }

    // --- Pages ---
    getPageBySlug(slug: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/pages/${slug}`);
    }

    getAuthPages(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/pages`);
    }

    createPage(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pages`, data);
    }

    updatePage(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/pages/${id}`, data);
    }

    deletePage(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/pages/${id}`);
    }
}
