import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserProfile } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  // Cached profile signal
  readonly profile = signal<UserProfile | null>(null);

  /**
   * Fetches user profile from backend API if not already cached
   */
  loadProfile() {
    // Return cached profile if already loaded
    if (this.profile()) {
      return;
    }

    this.http.get<UserProfile>(`${environment.apiUrl}/profile`)
      .subscribe({
        next: (profileData) => this.profile.set(profileData),
        error: (err) => {
          console.error('Failed to load user profile', err);
          this.profile.set(null);
        }
      });
  }

  /**
   * Clears the profile cache (called on logout)
   */
  clearProfile(): void {
    this.profile.set(null);
  }

  /**
   * Updates user profile details on the server and synchronizes the local cached profile signal.
   */
  updateProfile(
    fullName: string, 
    email: string, 
    currentPassword?: string, 
    newPassword?: string
  ): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${environment.apiUrl}/profile`, {
      fullName,
      email,
      currentPassword,
      newPassword
    }).pipe(
      tap(() => {
        const current = this.profile();
        if (current) {
          this.profile.set({
            ...current,
            fullName,
            email
          });
        }
      })
    );
  }
}
