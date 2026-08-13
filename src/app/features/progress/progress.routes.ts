import { Routes } from '@angular/router';

export const PROGRESS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/progress/progress.component').then(m => m.ProgressPageComponent)
  }
];
