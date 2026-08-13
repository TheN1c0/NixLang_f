import { Routes } from '@angular/router';
import { CatalogPageComponent } from './pages/catalog/catalog.component';

export const LESSONS_ROUTES: Routes = [
  {
    path: '',
    component: CatalogPageComponent
  },
  {
    path: 'play/:id',
    loadComponent: () => import('./pages/play/play.component').then(m => m.LessonPlayPageComponent)
  }
];
