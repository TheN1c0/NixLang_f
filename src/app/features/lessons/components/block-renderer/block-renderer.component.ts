import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { LessonBlock } from '../../models/lesson.model';
import { HeadingBlockComponent } from '../blocks/heading-block/heading-block.component';
import { ParagraphBlockComponent } from '../blocks/paragraph-block/paragraph-block.component';
import { SummaryBlockComponent } from '../blocks/summary-block/summary-block.component';
import { ExerciseBlockComponent } from '../blocks/exercise-block/exercise-block.component';

@Component({
  selector: 'app-lesson-block-renderer',
  standalone: true,
  imports: [
    HeadingBlockComponent,
    ParagraphBlockComponent,
    SummaryBlockComponent,
    ExerciseBlockComponent
  ],
  templateUrl: './block-renderer.component.html',
  styleUrl: './block-renderer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LessonBlockRendererComponent {
  @Input({ required: true }) block!: LessonBlock;
  @Input() result?: { givenAnswer: string; isCorrect: boolean };

  @Output() readonly exerciseResult = new EventEmitter<{ givenAnswer: string; isCorrect: boolean }>();

  handleExerciseAnswered(event: { givenAnswer: string; isCorrect: boolean }): void {
    this.exerciseResult.emit(event);
  }
}
