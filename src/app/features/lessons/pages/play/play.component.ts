import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LessonService } from '../../services/lesson.service';
import { LessonDetail, LessonBlock } from '../../models/lesson.model';
import { LessonBlockRendererComponent } from '../../components/block-renderer/block-renderer.component';

@Component({
  selector: 'app-lesson-play',
  standalone: true,
  imports: [RouterLink, LessonBlockRendererComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.css'
})
export class LessonPlayPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lessonService = inject(LessonService);

  // Core state signals
  readonly lessonDetail = signal<LessonDetail | null>(null);
  readonly activeBlockIndex = signal<number>(0);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  // Evaluation & Completion states
  readonly exerciseResults = signal<Record<string, { givenAnswer: string; isCorrect: boolean }>>({});
  readonly isCompleted = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLesson(id);
    } else {
      this.errorMessage.set('Identificador de lección no válido.');
      this.isLoading.set(false);
    }
  }

  loadLesson(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.lessonService.getLessonById(id).subscribe({
      next: (data) => {
        this.lessonDetail.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('No fue posible cargar la lección. Por favor, comprueba tu conexión.');
        this.isLoading.set(false);
      }
    });
  }

  retry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLesson(id);
    }
  }

  // Active block navigation
  next(): void {
    const detail = this.lessonDetail();
    if (!detail) return;

    const currentIdx = this.activeBlockIndex();
    if (currentIdx < detail.lessonBlocks.length - 1) {
      this.activeBlockIndex.set(currentIdx + 1);
      this.syncProgressToServer();
    } else {
      // Completed last block! Transition to results slide
      this.isCompleted.set(true);
      this.syncProgressToServer();
    }
  }

  prev(): void {
    const currentIdx = this.activeBlockIndex();
    if (currentIdx > 0) {
      this.activeBlockIndex.set(currentIdx - 1);
      this.syncProgressToServer();
    }
  }

  handleExerciseResult(exerciseId: string, result: { givenAnswer: string; isCorrect: boolean }): void {
    this.exerciseResults.update(current => ({
      ...current,
      [exerciseId]: result
    }));
    this.syncProgressToServer();
  }

  private syncProgressToServer(): void {
    const detail = this.lessonDetail();
    if (!detail) return;

    const percentage = Math.round(((this.activeBlockIndex() + 1) / detail.lessonBlocks.length) * 100);
    const status = this.isCompleted() ? 'Completed' : 'InProgress';

    // Map exercise results record to the array expected by the API
    const results = Object.entries(this.exerciseResults()).map(([exerciseId, res]) => ({
      exerciseId,
      givenAnswer: res.givenAnswer,
      isCorrect: res.isCorrect
    }));

    this.lessonService.saveProgress(detail.id, percentage, status, results).subscribe({
      next: (res) => {
        console.log('Progress saved successfully:', res);
      },
      error: (err) => {
        console.error('Failed to save progress:', err);
      }
    });
  }

  get totalAciertos(): number {
    const results = this.exerciseResults();
    return Object.values(results).filter(r => r.isCorrect).length;
  }

  get totalEjercicios(): number {
    return this.lessonDetail()?.exerciseCount || 0;
  }

  get porcentajeGeneral(): number {
    const total = this.totalEjercicios;
    if (total === 0) return 100;
    return Math.round((this.totalAciertos / total) * 100);
  }
}
