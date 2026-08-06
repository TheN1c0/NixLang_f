import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'lessons',
    loadChildren: () => import('./features/lessons/lessons.routes').then(m => m.LESSONS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'exercises',
    loadChildren: () => import('./features/exercises/exercises.routes').then(m => m.EXERCISES_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'progress',
    loadChildren: () => import('./features/progress/progress.routes').then(m => m.PROGRESS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
