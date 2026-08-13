import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagedResult, LessonSummary, LessonDetail, UserProgressResponse } from '../models/lesson.model';
import { environment } from '../../../../environments/environment';

export interface LessonSummaryApi {
  id: string;
  title: string;
  description: string;
  referenceLevel: string;
  isFavorite: boolean;
  progressPercentage: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches lessons from the real API.
   * Maps properties and sets default local UI values.
   */
  getLessons(
    page: number = 1, 
    pageSize: number = 10, 
    search?: string, 
    level?: string
  ): Observable<PagedResult<LessonSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (level && level !== 'Todos') {
      params = params.set('level', level);
    }

    return this.http.get<PagedResult<LessonSummaryApi>>(`${environment.apiUrl}/lessons`, { params }).pipe(
      map(res => {
        if (!res || !res.items) {
          return { items: [], page, pageSize, totalCount: 0, totalPages: 0 };
        }
        return {
          ...res,
          items: res.items.map(item => ({
            ...item,
            isFavorite: item.isFavorite ?? false,
            progressPercentage: item.progressPercentage ?? 0,
            status: item.status === 'Completed' ? 'Completada' as const : (item.status === 'InProgress' ? 'EnProgreso' as const : 'NoIniciada' as const)
          }))
        };
      })
    );
  }

  getLessonById(id: string): Observable<LessonDetail> {
    return this.http.get<LessonDetail>(`${environment.apiUrl}/lessons/${id}`);
  }

  /**
   * Toggles the favorite state of a lesson on the server.
   */
  toggleFavorite(id: string): Observable<{ isFavorite: boolean }> {
    return this.http.post<{ isFavorite: boolean }>(`${environment.apiUrl}/lessons/${id}/favorite`, {});
  }

  /**
   * Saves the current lesson progress and exercise results to the server.
   */
  saveProgress(
    id: string, 
    progressPercentage: number, 
    status: 'NotStarted' | 'InProgress' | 'Completed', 
    results: { exerciseId: string; givenAnswer: string; isCorrect: boolean }[]
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/lessons/${id}/progress`, {
      progressPercentage,
      status,
      results
    });
  }

  /**
   * Fetches statistics and progress history of the current user.
   */
  getUserProgress(): Observable<UserProgressResponse> {
    return this.http.get<UserProgressResponse>(`${environment.apiUrl}/lessons/progress`);
  }
}
