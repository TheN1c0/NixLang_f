import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'lessons',
        loadChildren: () => import('./features/lessons/lessons.routes').then(m => m.LESSONS_ROUTES)
      },
      {
        path: 'exercises',
        loadChildren: () => import('./features/exercises/exercises.routes').then(m => m.EXERCISES_ROUTES)
      },
      {
        path: 'progress',
        loadChildren: () => import('./features/progress/progress.routes').then(m => m.PROGRESS_ROUTES)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },
      {
        path: '',
        redirectTo: 'lessons',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'lessons'
  }
];
