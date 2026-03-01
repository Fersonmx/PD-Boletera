import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'client';
    phoneNumber?: string;
    googleId?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private _currentUser = new BehaviorSubject<User | null>(null);
    currentUser$ = this._currentUser.asObservable();

    // Signal for easier template binding in Angular 18+
    currentUserSig = signal<User | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        this.checkForToken();
    }

    private checkForToken(): void {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            const user = JSON.parse(userStr);
            this._currentUser.next(user);
            this.currentUserSig.set(user);
        }
    }

    login(credentials: { email: string, password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.setSession(response);
            })
        );
    }

    verifySms(userId: number, code: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/verify-sms`, { userId, code }).pipe(
            tap(response => {
                this.setSession(response);
            })
        );
    }

    googleLogin(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/google`, data).pipe(
            tap(response => {
                this.setSession(response);
            })
        );
    }

    updateProfile(data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
            tap(response => {
                // Update local session with new user data
                if (response.user) {
                    const token = localStorage.getItem('token') || '';
                    const user = response.user;
                    this.setSession({ token, user });
                }
            })
        );
    }

    updatePassword(data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/password`, data);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(token: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, password });
    }

    register(data: { name: string, email: string, password: string, phoneNumber?: string }): Observable<any> {
        // Response can be AuthResponse OR { message, userId, requires2FA }
        return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
            tap(response => {
                if (response.token) {
                    this.setSession(response);
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this._currentUser.next(null);
        this.currentUserSig.set(null);
        this.router.navigate(['/auth/login']);
    }

    private setSession(authResult: AuthResponse): void {
        localStorage.setItem('token', authResult.token);
        localStorage.setItem('user', JSON.stringify(authResult.user));
        this._currentUser.next(authResult.user);
        this.currentUserSig.set(authResult.user);
    }

    get token(): string | null {
        return localStorage.getItem('token');
    }

    get isAuthenticated(): boolean {
        return !!this.token;
    }

    get isAdmin(): boolean {
        return this.currentUserSig()?.role === 'admin';
    }
}
