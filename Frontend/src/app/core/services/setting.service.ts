import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SettingService {
    private apiUrl = `${environment.apiUrl}/settings`;

    constructor(private http: HttpClient) { }

    getSettings(): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<any>(this.apiUrl, { headers });
    }

    updateSetting(key: string, value: string): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.put<any>(this.apiUrl, { key, value }, { headers });
    }

    testEmail(config: any): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post<any>(`${this.apiUrl}/test-email`, config, { headers });
    }

    getEmailLogs(type?: string, status?: string): Observable<any[]> {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        let url = `${this.apiUrl}/email-logs?`;
        if (type) url += `type=${type}&`;
        if (status) url += `status=${status}`;
        return this.http.get<any[]>(url, { headers });
    }
}
