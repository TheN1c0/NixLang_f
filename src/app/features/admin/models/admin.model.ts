export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
}

export interface AdminExerciseOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface AdminExercise {
  id: string;
  type: 'MultipleChoice' | 'Translation' | 'FillInTheBlank' | 'Pronunciation';
  statement: string;
  correctAnswer?: string;
  audioResourceUrl?: string;
  options: AdminExerciseOption[];
}

export interface AdminLessonBlock {
  id?: string;
  type: 'Heading' | 'Paragraph' | 'Exercise';
  sequence: number;
  configurationValue: string;
  referencedExerciseId?: string;
  exercise?: AdminExercise;
}

export interface AdminLessonSummary {
  id: string;
  title: string;
  description: string;
  referenceLevel: 'A1' | 'A2' | 'B1' | 'B2';
  status: 'Draft' | 'Published';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminLessonDetail {
  id: string;
  title: string;
  description: string;
  referenceLevel: 'A1' | 'A2' | 'B1' | 'B2';
  status: 'Draft' | 'Published';
  exerciseCount: number;
  lessonBlocks: AdminLessonBlock[];
}
