import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'lessons',
        pathMatch: 'full'
      },
      {
        path: 'lessons',
        loadComponent: () => import('./pages/lessons/admin-lessons.component').then(m => m.AdminLessonsComponent)
      },
      {
        path: 'lessons/new',
        loadComponent: () => import('./pages/lessons/admin-lesson-form.component').then(m => m.AdminLessonFormComponent)
      },
      {
        path: 'lessons/edit/:id',
        loadComponent: () => import('./pages/lessons/admin-lesson-form.component').then(m => m.AdminLessonFormComponent)
      },
      {
        path: 'exercises',
        loadComponent: () => import('./pages/exercises/admin-exercises.component').then(m => m.AdminExercisesComponent)
      },
      {
        path: 'exercises/new',
        loadComponent: () => import('./pages/exercises/admin-exercise-form.component').then(m => m.AdminExerciseFormComponent)
      },
      {
        path: 'exercises/edit/:id',
        loadComponent: () => import('./pages/exercises/admin-exercise-form.component').then(m => m.AdminExerciseFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
      }
    ]
  }
];
