export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  referenceLevel: string;
  
  // Local UI-driven states (to be mapped to database state in future updates)
  isFavorite?: boolean;
  progressPercentage?: number;
  status?: 'NoIniciada' | 'EnProgreso' | 'Completada';
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
