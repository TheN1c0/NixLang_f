import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminCategory } from '../../models/admin.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly categories = signal<AdminCategory[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Form states
  readonly editMode = signal(false);
  readonly selectedCategoryId = signal<string | null>(null);
  nameInput = '';
  descriptionInput = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al cargar las categorías. Intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    const name = this.nameInput.trim();
    const description = this.descriptionInput.trim();

    if (!name) {
      this.errorMessage.set('El nombre de la categoría es obligatorio.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.editMode() && this.selectedCategoryId()) {
      // Edit mode
      const id = this.selectedCategoryId()!;
      this.adminService.updateCategory(id, name, description).subscribe({
        next: () => {
          this.successMessage.set('Categoría actualizada con éxito.');
          this.resetForm();
          this.loadCategories();
        },
        error: (err) => {
          console.error(err);
          if (err.status === 400 || err.error?.message?.includes('already exists')) {
            this.errorMessage.set('Ya existe una categoría con ese nombre.');
          } else {
            this.errorMessage.set('Error al actualizar la categoría.');
          }
          this.loading.set(false);
        }
      });
    } else {
      // Create mode
      this.adminService.createCategory(name, description).subscribe({
        next: () => {
          this.successMessage.set('Categoría creada con éxito.');
          this.resetForm();
          this.loadCategories();
        },
        error: (err) => {
          console.error(err);
          if (err.status === 400 || err.error?.message?.includes('already exists')) {
            this.errorMessage.set('Ya existe una categoría con ese nombre.');
          } else {
            this.errorMessage.set('Error al crear la categoría.');
          }
          this.loading.set(false);
        }
      });
    }
  }

  startEdit(category: AdminCategory): void {
    this.editMode.set(true);
    this.selectedCategoryId.set(category.id);
    this.nameInput = category.name;
    this.descriptionInput = category.description;
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  deleteCategory(id: string): void {
    if (!confirm('¿Está seguro de eliminar esta categoría? Se desasociará de las lecciones vinculadas.')) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage.set('Categoría eliminada con éxito.');
        this.loadCategories();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al eliminar la categoría.');
        this.loading.set(false);
      }
    });
  }

  resetForm(): void {
    this.editMode.set(false);
    this.selectedCategoryId.set(null);
    this.nameInput = '';
    this.descriptionInput = '';
  }
}
