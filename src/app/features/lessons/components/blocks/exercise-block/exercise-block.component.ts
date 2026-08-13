import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { Exercise } from '../../../models/lesson.model';

@Component({
  selector: 'app-exercise-block',
  standalone: true,
  templateUrl: './exercise-block.component.html',
  styleUrl: './exercise-block.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseBlockComponent {
  @Input({ required: true }) exercise!: Exercise;
  @Input() result?: { givenAnswer: string; isCorrect: boolean };

  @Output() readonly answered = new EventEmitter<{ givenAnswer: string; isCorrect: boolean }>();

  // Local active signals
  readonly selectedOption = signal<string | null>(null);
  readonly translationAnswer = signal<string>('');

  selectOption(optionText: string): void {
    if (this.result) return;
    this.selectedOption.set(optionText);
  }

  onTextChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.translationAnswer.set(input.value);
  }

  get currentGivenAnswer(): string {
    if (this.exercise.type === 'MultipleChoice') {
      return this.selectedOption() || '';
    } else {
      return this.translationAnswer().trim();
    }
  }

  get canVerify(): boolean {
    return this.currentGivenAnswer.length > 0;
  }

  verify(): void {
    if (!this.canVerify || this.result) return;

    const answer = this.currentGivenAnswer;
    const correct = this.exercise.correctAnswer || '';

    // Standard case-insensitive, trimmed comparison
    const isCorrect = answer.trim().toLowerCase() === correct.trim().toLowerCase();

    this.answered.emit({
      givenAnswer: answer,
      isCorrect
    });
  }
}
