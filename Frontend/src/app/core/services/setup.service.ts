import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SetupStatus {
    setupRequired: boolean;
}

export interface SetupData {
    adminName: string;
    adminEmail: string;
    adminPassword?: string;
    stripePublicKey?: string;
    stripeSecretKey?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SetupService {
    private apiUrl = `${environment.apiUrl}/setup`;
    private _setupRequired: boolean | null = null;

    constructor(private http: HttpClient) { }

    get setupRequired(): boolean | null {
        return this._setupRequired;
    }

    checkStatus(): Observable<SetupStatus> {
        return this.http.get<SetupStatus>(`${this.apiUrl}/status`).pipe(
            tap(status => this._setupRequired = status.setupRequired)
        );
    }

    performSetup(data: SetupData): Observable<any> {
        return this.http.post(this.apiUrl, data).pipe(
            tap(() => this._setupRequired = false)
        );
    }
}
