import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LessonService } from '../../../lessons/services/lesson.service';
import { UserService } from '../../../../core/services/user.service';
import { UserLessonProgress, UserStats } from '../../../lessons/models/lesson.model';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css'
})
export class ProgressPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lessonService = inject(LessonService);
  readonly userService = inject(UserService);

  // Stats & Progress signals
  readonly stats = signal<UserStats | null>(null);
  readonly progressList = signal<UserLessonProgress[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  // Profile Form
  profileForm!: FormGroup;
  readonly isSaving = signal<boolean>(false);
  readonly saveSuccess = signal<boolean>(false);
  readonly saveError = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.loadProgressData();

    // Populate form if cached profile exists
    const currentProfile = this.userService.profile();
    if (currentProfile) {
      this.profileForm.patchValue({
        fullName: currentProfile.fullName,
        email: currentProfile.email
      });
    }
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]]
    });
  }

  private loadProgressData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.lessonService.getUserProgress().subscribe({
      next: (res) => {
        this.stats.set(res.stats);
        this.progressList.set(res.progressList);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('No se pudo recuperar el historial de progreso.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    const values = this.profileForm.value;

    this.userService.updateProfile(
      values.fullName,
      values.email,
      values.currentPassword || undefined,
      values.newPassword || undefined
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        // Reset password fields
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: ''
        });
      },
      error: (err) => {
        console.error(err);
        this.isSaving.set(false);
        this.saveError.set(
          err.error?.message || 
          'Error al actualizar el perfil. Comprueba los campos.'
        );
      }
    });
  }
}
