import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminExercise } from '../../models/admin.model';

@Component({
  selector: 'app-admin-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-exercises.component.html',
  styleUrl: './admin-exercises.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminExercisesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly exercises = signal<AdminExercise[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Pagination & Search
  readonly currentPage = signal(1);
  readonly pageSize = 10;
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  searchText = '';

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.adminService.getExercises(this.currentPage(), this.pageSize, this.searchText.trim() || undefined).subscribe({
      next: (res) => {
        this.exercises.set(res.items || []);
        this.totalCount.set(res.totalCount || 0);
        this.totalPages.set(res.totalPages || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al cargar la lista de ejercicios.');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadExercises();
  }

  clearSearch(): void {
    this.searchText = '';
    this.onSearch();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
    this.loadExercises();
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }

  editExercise(id: string): void {
    this.router.navigate(['/admin/exercises/edit', id]);
  }

  deleteExercise(id: string): void {
    if (!confirm('¿Está seguro de eliminar este ejercicio? Esta acción es irreversible.')) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService.deleteExercise(id).subscribe({
      next: () => {
        this.successMessage.set('Ejercicio eliminado con éxito.');
        this.currentPage.set(1);
        this.loadExercises();
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        if (err.status === 409 || err.error?.message?.includes('in use') || err.error?.message?.includes('utilizado')) {
          this.errorMessage.set('No se puede eliminar el ejercicio porque está siendo utilizado en una o más lecciones. Debe desasociarlo primero.');
        } else {
          this.errorMessage.set('Error al intentar eliminar el ejercicio.');
        }
      }
    });
  }

  translateType(type: string): string {
    switch (type) {
      case 'MultipleChoice': return 'Opción Múltiple';
      case 'Translation': return 'Traducción';
      case 'FillInTheBlank': return 'Completar Espacio';
      case 'Pronunciation': return 'Pronunciación';
      default: return type;
    }
  }
}
