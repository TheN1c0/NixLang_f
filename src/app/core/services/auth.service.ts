import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse } from '../models/auth.model';
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
}
