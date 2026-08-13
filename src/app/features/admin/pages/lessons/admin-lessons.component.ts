import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminLessonSummary } from '../../models/admin.model';

@Component({
  selector: 'app-admin-lessons',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-lessons.component.html',
  styleUrl: './admin-lessons.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLessonsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly lessons = signal<AdminLessonSummary[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = 6; // Matching mock vistaadmin.png showing 6 items per page
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  // Computed KPIs based on database
  readonly kpiTotalLessons = computed(() => this.totalCount());
  readonly exercisesTotal = signal(0);

  ngOnInit(): void {
    this.loadLessons();
    this.loadExercisesCount();
  }

  loadExercisesCount(): void {
    this.adminService.getExercises(1, 1).subscribe({
      next: (res) => {
        this.exercisesTotal.set(res.totalCount || 0);
      },
      error: (err) => console.error('Failed to load exercises total count for KPI', err)
    });
  }

  loadLessons(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.adminService.getLessons(this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.lessons.set(res.items || []);
        this.totalCount.set(res.totalCount || 0);
        this.totalPages.set(res.totalPages || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al cargar la lista de lecciones.');
        this.loading.set(false);
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
    this.loadLessons();
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }

  editLesson(id: string): void {
    this.router.navigate(['/admin/lessons/edit', id]);
  }

  deleteLesson(id: string): void {
    if (!confirm('¿Está seguro de eliminar esta lección? Se eliminarán en cascada todos sus bloques asociados. Los ejercicios vinculados quedarán intactos.')) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService.deleteLesson(id).subscribe({
      next: () => {
        this.successMessage.set('Lección eliminada con éxito.');
        this.currentPage.set(1);
        this.loadLessons();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al eliminar la lección.');
        this.loading.set(false);
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
