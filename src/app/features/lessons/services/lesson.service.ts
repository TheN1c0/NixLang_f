import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PagedResult, LessonSummary } from '../models/lesson.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private readonly http = inject(HttpClient);

  // High-fidelity development fallback list (used if database is empty or API is offline)
  private readonly devLessons: LessonSummary[] = [
    {
      id: 'd1a0be00-1234-5678-abcd-111122223333',
      title: 'Presente Simple en el Aeropuerto',
      description: 'Aprende a comunicarte en migraciones y a reclamar tu equipaje utilizando el presente simple en inglés sin presiones.',
      referenceLevel: 'A1',
      isFavorite: false,
      progressPercentage: 100,
      status: 'Completada'
    },
    {
      id: 'd1a0be00-1234-5678-abcd-444455556666',
      title: 'Vocabulario para Reuniones de Trabajo',
      description: 'Términos clave, verbos preposicionales y expresiones comunes en el entorno corporativo de la tecnología.',
      referenceLevel: 'B1',
      isFavorite: true,
      progressPercentage: 45,
      status: 'EnProgreso'
    },
    {
      id: 'd1a0be00-1234-5678-abcd-777788889999',
      title: 'Pedir Comida en un Restaurante',
      description: 'Estructuras de cortesía, expresiones comunes y cómo interactuar con el personal de un restaurante de forma fluida.',
      referenceLevel: 'A2',
      isFavorite: false,
      progressPercentage: 0,
      status: 'NoIniciada'
    },
    {
      id: 'd1a0be00-1234-5678-abcd-aaaabbbbcccc',
      title: 'Debatiendo Ideas en Linear y Slack',
      description: 'Cómo argumentar con respeto, manifestar desacuerdos profesionales y redactar actualizaciones de forma concisa.',
      referenceLevel: 'B2',
      isFavorite: false,
      progressPercentage: 0,
      status: 'NoIniciada'
    }
  ];

  /**
   * Fetches lessons from real API with fallback to high-fidelity dev items
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

    return this.http.get<PagedResult<LessonSummary>>(`${environment.apiUrl}/lessons`, { params }).pipe(
      map(res => {
        // If API returns empty collection, fallback to dev items
        if (!res || !res.items || res.items.length === 0) {
          return this.getDevLessonsPaged(page, pageSize, search, level);
        }

        // Map backend properties and supply default local UI values
        return {
          ...res,
          items: res.items.map(item => ({
            ...item,
            isFavorite: false,
            progressPercentage: 0,
            status: 'NoIniciada' as const
          }))
        };
      }),
      catchError(() => {
        // API offline or error fallback
        return of(this.getDevLessonsPaged(page, pageSize, search, level));
      })
    );
  }

  /**
   * Filters and pages the development mock data in-memory
   */
  private getDevLessonsPaged(
    page: number, 
    pageSize: number, 
    search?: string, 
    level?: string
  ): PagedResult<LessonSummary> {
    let filtered = [...this.devLessons];

    // Filter by search term
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        l => l.title.toLowerCase().includes(query) || l.description.toLowerCase().includes(query)
      );
    }

    // Filter by CEFR Level
    if (level && level !== 'Todos') {
      filtered = filtered.filter(l => l.referenceLevel.toUpperCase() === level.toUpperCase());
    }

    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      page,
      pageSize,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize)
    };
  }
}
