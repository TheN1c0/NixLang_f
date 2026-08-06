import { Component, OnInit, inject, signal } from '@angular/core';
import { LessonService } from '../../services/lesson.service';
import { UserService } from '../../../../core/services/user.service';
import { LessonSummary } from '../../models/lesson.model';
import { LessonCardComponent } from '../../components/lesson-card/lesson-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [LessonCardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogPageComponent implements OnInit {
  private readonly lessonService = inject(LessonService);
  readonly userService = inject(UserService);

  // Filter & Search states
  readonly selectedLevel = signal<string>('Todos');
  readonly searchQuery = signal<string>('');
  readonly levels = ['Todos', 'A1', 'A2', 'B1', 'B2'];

  // Lessons list & Loading signals
  readonly lessons = signal<LessonSummary[]>([]);
  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadLessons();
  }

  /**
   * Triggers the lesson fetch from backend service
   */
  loadLessons(): void {
    this.loading.set(true);
    this.lessonService.getLessons(1, 20, this.searchQuery(), this.selectedLevel())
      .subscribe({
        next: (res) => {
          this.lessons.set(res.items);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  /**
   * Level filter pills select routine
   */
  selectLevel(level: string): void {
    this.selectedLevel.set(level);
    this.loadLessons();
  }

  /**
   * Search input handler
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.loadLessons();
  }

  /**
   * Toggles the favorite star state reactively in memory
   */
  handleToggleFavorite(lessonId: string): void {
    this.lessons.update(list => list.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, isFavorite: !lesson.isFavorite } 
        : lesson
    ));
  }

  /**
   * Handles the lesson startup/resume/repass clicking events.
   * Simulates real progress incrementing for interactive client validation.
   */
  handleStart(lessonId: string): void {
    this.lessons.update(list => list.map(lesson => {
      if (lesson.id === lessonId) {
        if (!lesson.status || lesson.status === 'NoIniciada') {
          return { ...lesson, status: 'EnProgreso', progressPercentage: 25 };
        } else if (lesson.status === 'EnProgreso') {
          const nextVal = (lesson.progressPercentage || 0) + 25;
          if (nextVal >= 100) {
            return { ...lesson, status: 'Completada', progressPercentage: 100 };
          } else {
            return { ...lesson, progressPercentage: nextVal };
          }
        } else {
          // Reset to repass (NoIniciada)
          return { ...lesson, status: 'NoIniciada', progressPercentage: 0 };
        }
      }
      return lesson;
    }));
  }
}
