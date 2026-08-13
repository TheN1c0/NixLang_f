import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-summary-block',
  standalone: true,
  template: `
    <div class="block-summary-card">
      <div class="summary-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="summary-icon" aria-hidden="true">
          <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-560v-160H240v640h480v-480H520ZM240-800v160-160 640-640Z"/>
        </svg>
        <span class="summary-title">Resumen de la Lección</span>
      </div>
      <p class="summary-text">{{ text }}</p>
    </div>
  `,
  styles: [`
    .block-summary-card {
      background-color: var(--color-background);
      border: 1.5px dashed var(--color-primary);
      border-radius: var(--radius-md);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
    }
    .summary-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
      color: var(--color-primary);
    }
    .summary-icon {
      width: 20px;
      height: 20px;
    }
    .summary-title {
      font-weight: 700;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .summary-text {
      font-size: 1rem;
      line-height: 1.5;
      color: var(--color-text);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryBlockComponent {
  @Input({ required: true }) text!: string;
}
