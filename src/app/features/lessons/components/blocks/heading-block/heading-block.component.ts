import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-heading-block',
  standalone: true,
  template: `
    <h2 class="block-heading">{{ text }}</h2>
  `,
  styles: [`
    .block-heading {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: var(--space-4);
      line-height: 1.3;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadingBlockComponent {
  @Input({ required: true }) text!: string;
}
