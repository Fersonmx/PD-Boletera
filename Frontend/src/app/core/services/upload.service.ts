import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private apiUrl = `${environment.apiUrl}/upload`;

    constructor(private http: HttpClient) { }

    uploadImage(file: File): Observable<{ message: string, filePath: string, fileName: string }> {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.post<{ message: string, filePath: string, fileName: string }>(this.apiUrl, formData, { headers });
    }
}
