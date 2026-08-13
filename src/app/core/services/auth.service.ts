import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse, RegisterResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'nixlang_session';

  // Session state reactive signal
  readonly session = signal<LoginResponse | null>(null);

  // Computed state to verify if user is authenticated and token is not expired
  readonly isAuthenticated = computed(() => {
    const currentSession = this.session();
    if (!currentSession) {
      return false;
    }
    // Verify that current time is before the token expiration date
    return new Date() < new Date(currentSession.expiresAt);
  });

  constructor() {
    this.initializeSession();
  }

  /**
   * Performs authentication request to NixLang API
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(res => {
        this.session.set(res);
        localStorage.setItem(this.storageKey, JSON.stringify(res));
      })
    );
  }

  /**
   * Performs user registration request to NixLang API
   */
  register(fullName: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, {
      fullName,
      email,
      password
    });
  }

  /**
   * Purges session signals and local storage
   */
  logout(): void {
    this.session.set(null);
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Loads session from localStorage upon initialization
   */
  private initializeSession(): void {
    const savedSession = localStorage.getItem(this.storageKey);
    if (!savedSession) {
      return;
    }

    try {
      const parsed = JSON.parse(savedSession) as LoginResponse;
      // If the loaded token is already expired, purge it
      if (new Date() < new Date(parsed.expiresAt)) {
        this.session.set(parsed);
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Decodes JWT token payload and returns roles array
   */
  getRoles(): string[] {
    const currentSession = this.session();
    if (!currentSession?.accessToken) {
      return [];
    }
    try {
      const payloadBase64 = currentSession.accessToken.split('.')[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      const role = payload.role;
      if (!role) {
        return [];
      }
      return Array.isArray(role) ? role : [role];
    } catch (e) {
      console.error('Failed to decode JWT token', e);
      return [];
    }
  }

  /**
   * Checks if user is authenticated and has administrative role
   */
  isAdmin(): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }
    const roles = this.getRoles();
    return roles.includes('Administrator') || roles.includes('Admin');
  }
}
