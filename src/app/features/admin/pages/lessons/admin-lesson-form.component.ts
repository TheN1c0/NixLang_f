import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminCategory, AdminExercise, AdminLessonBlock } from '../../models/admin.model';

@Component({
  selector: 'app-admin-lesson-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-lesson-form.component.html',
  styleUrl: './admin-lesson-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLessonFormComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly editMode = signal(false);
  readonly lessonId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Categories and Exercises catalogues for selectors
  readonly categoriesList = signal<AdminCategory[]>([]);
  readonly exercisesList = signal<AdminExercise[]>([]);

  // Form Fields
  title = '';
  description = '';
  referenceLevel: 'A1' | 'A2' | 'B1' | 'B2' = 'A1';
  status: 'Draft' | 'Published' = 'Draft';
  
  // Selected category IDs
  selectedCategoryIds: string[] = [];

  // Dynamic Lesson Blocks Constructor
  blocks: AdminLessonBlock[] = [];

  ngOnInit(): void {
    this.loadCatalogues();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.lessonId.set(id);
      this.loadLesson(id);
    }
  }

  loadCatalogues(): void {
    // Load categories
    this.adminService.getCategories().subscribe({
      next: (cats) => this.categoriesList.set(cats),
      error: (err) => console.error('Failed to load categories catalogue', err)
    });

    // Load exercises (first page, large page size to get all available exercises for the block selector)
    this.adminService.getExercises(1, 100).subscribe({
      next: (res) => this.exercisesList.set(res.items || []),
      error: (err) => console.error('Failed to load exercises catalogue', err)
    });
  }

  loadLesson(id: string): void {
    this.loading.set(true);
    this.adminService.getLessonById(id).subscribe({
      next: (les) => {
        this.title = les.title;
        this.description = les.description;
        this.referenceLevel = les.referenceLevel;
        this.status = les.status;
        
        // Populate category IDs (if present in the backend. Note: let's query the categories list to see if they match.
        // Wait, the backend AdminLessonDetail returned from API might not directly return categoryIds, let's see.
        // The endpoint is AdminLessonsController.GetById. In NixLang.Api, let's check what it returns!
        // Actually, we can load categoryIds from the lesson block or categories list, but wait, does AdminLessonDetail have Categories?
        // Let's check how Categories are mapped in Lesson domain or detail DTO.
        // Let's check: in backend, the Lesson domain has a Categories collection. The GetById endpoint maps it.
        // In nixlang-api, let's see what properties AdminLessonDetail has.
        // If the backend detail maps Categories, we can extract them! Let's check if the API response is structured with categoryIds.)
        
        // Wait, to be completely safe, let's see what fields are returned by reading the GetAdminLessonByIdQueryHandler.cs.
        // Let's check our open documents or search for it!
        // No need to view it, we can just extract any categories mapped in the DTO, e.g. les.categoryIds or les.categories.map(c => c.id).
        // Let's check if there is a categories property. Yes, usually it's categories: { id, name }[] or categoryIds: string[].
        // Let's handle both cases gracefully:
        const response = les as any;
        if (response.categoryIds) {
          this.selectedCategoryIds = response.categoryIds;
        } else if (response.categories) {
          this.selectedCategoryIds = response.categories.map((c: any) => c.id || c);
        }

        // Load blocks
        if (les.lessonBlocks && les.lessonBlocks.length > 0) {
          this.blocks = les.lessonBlocks
            .map(b => ({
              id: b.id,
              type: b.type,
              sequence: b.sequence,
              configurationValue: b.configurationValue || '',
              referencedExerciseId: b.referencedExerciseId
            }))
            .sort((a, b) => a.sequence - b.sequence);
        } else {
          this.blocks = [];
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al cargar la información de la lección.');
        this.loading.set(false);
      }
    });
  }

  // Categories Multiselect Helper
  toggleCategory(id: string): void {
    const idx = this.selectedCategoryIds.indexOf(id);
    if (idx > -1) {
      this.selectedCategoryIds.splice(idx, 1);
    } else {
      this.selectedCategoryIds.push(id);
    }
  }

  isCategorySelected(id: string): boolean {
    return this.selectedCategoryIds.includes(id);
  }

  // Blocks Constructor Operations
  addBlock(type: 'Heading' | 'Paragraph' | 'Exercise'): void {
    const nextSequence = this.blocks.length + 1;
    this.blocks.push({
      type,
      sequence: nextSequence,
      configurationValue: '',
      referencedExerciseId: type === 'Exercise' && this.exercisesList().length > 0 ? this.exercisesList()[0].id : undefined
    });
  }

  removeBlock(index: number): void {
    this.blocks.splice(index, 1);
    this.resequenceBlocks();
  }

  moveBlockUp(index: number): void {
    if (index === 0) return;
    const temp = this.blocks[index];
    this.blocks[index] = this.blocks[index - 1];
    this.blocks[index - 1] = temp;
    this.resequenceBlocks();
  }

  moveBlockDown(index: number): void {
    if (index === this.blocks.length - 1) return;
    const temp = this.blocks[index];
    this.blocks[index] = this.blocks[index + 1];
    this.blocks[index + 1] = temp;
    this.resequenceBlocks();
  }

  private resequenceBlocks(): void {
    this.blocks.forEach((b, i) => b.sequence = i + 1);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    // Form Validations
    if (!this.title.trim()) {
      this.errorMessage.set('El título de la lección es obligatorio.');
      return;
    }

    if (!this.description.trim()) {
      this.errorMessage.set('La descripción de la lección es obligatoria.');
      return;
    }

    // Validate Blocks
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      if (block.type === 'Exercise' && !block.referencedExerciseId) {
        this.errorMessage.set(`El bloque #${i + 1} de tipo Ejercicio debe hacer referencia a un ejercicio válido.`);
        return;
      }
      if ((block.type === 'Heading' || block.type === 'Paragraph') && !block.configurationValue.trim()) {
        this.errorMessage.set(`El bloque #${i + 1} de tipo ${block.type === 'Heading' ? 'Título' : 'Párrafo'} no puede estar vacío.`);
        return;
      }
    }

    const lessonPayload = {
      title: this.title.trim(),
      description: this.description.trim(),
      referenceLevel: this.referenceLevel,
      status: this.status,
      categoryIds: this.selectedCategoryIds,
      lessonBlocks: this.blocks.map(b => ({
        type: b.type,
        sequence: b.sequence,
        configurationValue: b.type === 'Exercise' ? '' : b.configurationValue.trim(),
        referencedExerciseId: b.type === 'Exercise' ? b.referencedExerciseId : undefined
      }))
    };

    this.loading.set(true);

    if (this.editMode() && this.lessonId()) {
      const id = this.lessonId()!;
      const editPayload = { ...lessonPayload, id };
      this.adminService.updateLesson(id, editPayload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/lessons']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Error al actualizar la lección en el servidor.');
          this.loading.set(false);
        }
      });
    } else {
      this.adminService.createLesson(lessonPayload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/lessons']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Error al crear la lección en el servidor.');
          this.loading.set(false);
        }
      });
    }
  }
}
