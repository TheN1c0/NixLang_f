import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Form Definition
  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  // UI State Signals
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Getters for template validation
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const emailValue = this.loginForm.value.email;
    const passwordValue = this.loginForm.value.password;

    this.authService.login(emailValue, passwordValue).subscribe({
      next: () => {
        this.loading.set(false);
        // Delegate navigation to the component upon successful login
        this.router.navigate(['/lessons']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          // Genera un error genérico (Username Enumeration Prevention)
          this.errorMessage.set('Credenciales inválidas. Por favor, intenta de nuevo.');
        } else {
          // Error de conexión o de servidor
          this.errorMessage.set('Error de conexión. No se pudo establecer comunicación con el servidor.');
        }
      }
    });
  }
}
