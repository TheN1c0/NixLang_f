import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
  readonly blankAnswer = signal<string>('');

  // Computes prefix and suffix if statement contains blanks (e.g. "She ___ to school")
  readonly statementSegments = computed(() => {
    const stmt = this.exercise?.statement || '';
    const blankPattern = /_{2,}|\[blank\]|\.{3,}/i;
    const match = stmt.match(blankPattern);

    if (match && match.index !== undefined) {
      return {
        hasInlineBlank: true,
        before: stmt.substring(0, match.index).trimEnd(),
        after: stmt.substring(match.index + match[0].length).trimStart()
      };
    }

    return {
      hasInlineBlank: false,
      before: stmt,
      after: ''
    };
  });

  selectOption(optionText: string): void {
    if (this.result) return;
    this.selectedOption.set(optionText);
  }

  onTranslationChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.translationAnswer.set(input.value);
  }

  onBlankChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.blankAnswer.set(input.value);
  }

  get currentGivenAnswer(): string {
    if (this.exercise.type === 'MultipleChoice') {
      return this.selectedOption() || '';
    } else if (this.exercise.type === 'FillInTheBlank') {
      return this.blankAnswer().trim();
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

