export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  referenceLevel: string;
  
  // Local UI-driven states (will map to persistent state once backend endpoints exist)
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

export interface ExerciseOption {
  id: string;
  text: string;
  displayOrder: number;
}

export interface Exercise {
  id: string;
  type: 'Translation' | 'FillInTheBlank' | 'MultipleChoice' | 'Pronunciation';
  statement: string;
  correctAnswer?: string;
  audioResourceUrl?: string;
  options: ExerciseOption[];
}

export interface LessonBlock {
  id: string;
  type: 'Heading' | 'Paragraph' | 'Image' | 'Audio' | 'Exercise' | 'Feedback' | 'Review' | 'Summary';
  sequence: number;
  configurationValue: string;
  referencedExerciseId?: string;
  exercise?: Exercise;
}

export interface LessonDetail {
  id: string;
  title: string;
  description: string;
  referenceLevel: string;
  exerciseCount: number;
  lessonBlocks: LessonBlock[];
}

export interface UserLessonProgress {
  lessonId: string;
  lessonTitle: string;
  referenceLevel: string;
  progressPercentage: number;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export interface UserStats {
  lessonsCompleted: number;
  lessonsInProgress: number;
  favoritesCount: number;
}

export interface UserProgressResponse {
  stats: UserStats;
  progressList: UserLessonProgress[];
  favoriteLessonIds: string[];
}
