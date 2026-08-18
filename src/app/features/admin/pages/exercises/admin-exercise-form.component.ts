import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminExercise, AdminExerciseOption } from '../../models/admin.model';

@Component({
  selector: 'app-admin-exercise-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-exercise-form.component.html',
  styleUrl: './admin-exercise-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminExerciseFormComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly editMode = signal(false);
  readonly exerciseId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Form Fields
  type: 'MultipleChoice' | 'Translation' | 'FillInTheBlank' = 'MultipleChoice';
  statement = '';
  audioResourceUrl = '';
  correctAnswer = '';

  // Dynamic Options (For MultipleChoice)
  options: AdminExerciseOption[] = [
    { text: '', isCorrect: false, displayOrder: 1 },
    { text: '', isCorrect: false, displayOrder: 2 }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.exerciseId.set(id);
      this.loadExercise(id);
    }
  }

  loadExercise(id: string): void {
    this.loading.set(true);
    this.adminService.getExerciseById(id).subscribe({
      next: (ex) => {
        // Only allow editing supported types
        if (ex.type !== 'MultipleChoice' && ex.type !== 'Translation' && ex.type !== 'FillInTheBlank') {
          this.errorMessage.set(`El tipo de ejercicio '${ex.type}' no está soportado en esta versión.`);
          this.loading.set(false);
          return;
        }

        this.type = ex.type;
        this.statement = ex.statement;
        this.audioResourceUrl = ex.audioResourceUrl || '';
        this.correctAnswer = ex.correctAnswer || '';
        if (ex.options && ex.options.length > 0) {
          // Sort options by display order
          this.options = ex.options
            .map(o => ({ ...o }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        } else {
          this.options = [];
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al cargar la información del ejercicio.');
        this.loading.set(false);
      }
    });
  }

  // Options CRUD inside MultipleChoice
  addOption(): void {
    const nextOrder = this.options.length + 1;
    this.options.push({ text: '', isCorrect: false, displayOrder: nextOrder });
  }

  removeOption(index: number): void {
    this.options.splice(index, 1);
    // Re-sequence orders
    this.options.forEach((o, i) => o.displayOrder = i + 1);
  }

  setOptionAsCorrect(index: number): void {
    this.options.forEach((o, i) => o.isCorrect = (i === index));
    this.correctAnswer = this.options[index].text;
  }

  onOptionTextChange(index: number, text: string): void {
    this.options[index].text = text;
    // If this option is marked as correct, sync correctAnswer
    if (this.options[index].isCorrect) {
      this.correctAnswer = text;
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    // General Validations
    if (!this.statement.trim()) {
      this.errorMessage.set('El enunciado del ejercicio es obligatorio.');
      return;
    }

    let exercisePayload: Omit<AdminExercise, 'id'>;

    if (this.type === 'MultipleChoice') {
      // Multiple Choice Validations
      if (this.options.length < 2) {
        this.errorMessage.set('Un ejercicio de opción múltiple debe tener al menos 2 alternativas.');
        return;
      }

      if (this.options.some(o => !o.text.trim())) {
        this.errorMessage.set('Todas las alternativas deben tener texto.');
        return;
      }

      const correctIndex = this.options.findIndex(o => o.isCorrect);
      if (correctIndex === -1) {
        this.errorMessage.set('Debe seleccionar una alternativa como correcta.');
        return;
      }

      // Sync correct answer text
      this.correctAnswer = this.options[correctIndex].text.trim();

      exercisePayload = {
        type: 'MultipleChoice',
        statement: this.statement.trim(),
        audioResourceUrl: this.audioResourceUrl.trim() || undefined,
        correctAnswer: this.correctAnswer,
        options: this.options.map(o => ({
          id: o.id,
          text: o.text.trim(),
          isCorrect: o.isCorrect,
          displayOrder: o.displayOrder
        }))
      };
    } else if (this.type === 'FillInTheBlank') {
      // Fill In The Blank Validations
      if (!this.correctAnswer.trim()) {
        this.errorMessage.set('La palabra o frase faltante es obligatoria para completar espacios.');
        return;
      }

      exercisePayload = {
        type: 'FillInTheBlank',
        statement: this.statement.trim(),
        audioResourceUrl: this.audioResourceUrl.trim() || undefined,
        correctAnswer: this.correctAnswer.trim(),
        options: []
      };
    } else {
      // Translation Validations
      if (!this.correctAnswer.trim()) {
        this.errorMessage.set('La respuesta correcta es obligatoria para traducción.');
        return;
      }

      exercisePayload = {
        type: 'Translation',
        statement: this.statement.trim(),
        audioResourceUrl: this.audioResourceUrl.trim() || undefined,
        correctAnswer: this.correctAnswer.trim(),
        options: []
      };
    }


    this.loading.set(true);

    if (this.editMode() && this.exerciseId()) {
      const id = this.exerciseId()!;
      const editPayload: AdminExercise = { ...exercisePayload, id };
      this.adminService.updateExercise(id, editPayload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/exercises']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Error al actualizar el ejercicio en el servidor.');
          this.loading.set(false);
        }
      });
    } else {
      this.adminService.createExercise(exercisePayload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/exercises']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Error al crear el ejercicio en el servidor.');
          this.loading.set(false);
        }
      });
    }
  }
}
