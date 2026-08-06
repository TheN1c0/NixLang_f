import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

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

    // Simulate API authentication call
    setTimeout(() => {
      const emailValue = this.loginForm.value.email;
      const passwordValue = this.loginForm.value.password;

      // Mock validation matching common test cases
      if (emailValue === 'demo@nixlang.com' && passwordValue === 'password123') {
        this.loading.set(false);
        // Successful path: would redirect to catalog
        alert('¡Inicio de sesión exitoso!');
      } else {
        this.loading.set(false);
        // Prevents account enumeration by using generic error message (RN-04/Security rule)
        this.errorMessage.set('Credenciales inválidas. Por favor, intenta de nuevo.');
      }
    }, 1200);
  }
}
