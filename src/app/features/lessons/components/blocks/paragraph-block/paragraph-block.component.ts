import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-paragraph-block',
  standalone: true,
  template: `
    <p class="block-paragraph">{{ text }}</p>
  `,
  styles: [`
    .block-paragraph {
      font-size: 1.05rem;
      line-height: 1.6;
      color: var(--color-text);
      margin-bottom: var(--space-4);
      white-space: pre-wrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParagraphBlockComponent {
  @Input({ required: true }) text!: string;
}
