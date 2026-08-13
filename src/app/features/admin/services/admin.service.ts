import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  PagedResult, 
  AdminCategory, 
  AdminExercise, 
  AdminLessonSummary, 
  AdminLessonDetail 
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);

  // --- CATEGORIES ---
  getCategories(): Observable<AdminCategory[]> {
    return this.http.get<AdminCategory[]>(`${environment.apiUrl}/admin/categories`);
  }

  createCategory(name: string, description: string): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${environment.apiUrl}/admin/categories`, { name, description });
  }

  updateCategory(id: string, name: string, description: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${environment.apiUrl}/admin/categories/${id}`, { id, name, description });
  }

  deleteCategory(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/admin/categories/${id}`);
  }

  // --- EXERCISES ---
  getExercises(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<AdminExercise>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedResult<AdminExercise>>(`${environment.apiUrl}/admin/exercises`, { params });
  }

  getExerciseById(id: string): Observable<AdminExercise> {
    return this.http.get<AdminExercise>(`${environment.apiUrl}/admin/exercises/${id}`);
  }

  createExercise(exercise: Omit<AdminExercise, 'id'>): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${environment.apiUrl}/admin/exercises`, exercise);
  }

  updateExercise(id: string, exercise: AdminExercise): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${environment.apiUrl}/admin/exercises/${id}`, exercise);
  }

  deleteExercise(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/admin/exercises/${id}`);
  }

  // --- LESSONS ---
  getLessons(page: number = 1, pageSize: number = 10): Observable<PagedResult<AdminLessonSummary>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<AdminLessonSummary>>(`${environment.apiUrl}/admin/lessons`, { params });
  }

  getLessonById(id: string): Observable<AdminLessonDetail> {
    return this.http.get<AdminLessonDetail>(`${environment.apiUrl}/admin/lessons/${id}`);
  }

  createLesson(lesson: {
    title: string;
    description: string;
    referenceLevel: string;
    categoryIds?: string[];
    lessonBlocks?: { type: string; configurationValue: string; referencedExerciseId?: string }[];
  }): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${environment.apiUrl}/admin/lessons`, lesson);
  }

  updateLesson(id: string, lesson: {
    id: string;
    title: string;
    description: string;
    referenceLevel: string;
    status: string;
    categoryIds?: string[];
    lessonBlocks?: { type: string; configurationValue: string; referencedExerciseId?: string }[];
  }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${environment.apiUrl}/admin/lessons/${id}`, lesson);
  }

  deleteLesson(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/admin/lessons/${id}`);
  }
}
