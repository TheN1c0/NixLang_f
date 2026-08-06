import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { LessonSummary } from '../../models/lesson.model';

@Component({
  selector: 'app-lesson-card',
  standalone: true,
  imports: [],
  templateUrl: './lesson-card.component.html',
  styleUrl: './lesson-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LessonCardComponent {
  // Input lesson data
  @Input({ required: true }) lesson!: LessonSummary;

  // Presentational Outputs (Delegating business actions up to the smart Catalog component)
  @Output() readonly start = new EventEmitter<string>();
  @Output() readonly toggleFavorite = new EventEmitter<string>();

  onStart(): void {
    this.start.emit(this.lesson.id);
  }

  onToggleFavorite(event: Event): void {
    // Prevent starting the lesson when clicking the star icon
    event.stopPropagation();
    this.toggleFavorite.emit(this.lesson.id);
  }
}
