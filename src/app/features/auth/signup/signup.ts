import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../firebase-auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { MaterialImportsModule } from '../../../material-imports.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
  imports: [CommonModule, MaterialImportsModule, ReactiveFormsModule, MatProgressSpinnerModule],
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(FirebaseAuthService);
  private router = inject(Router);

  signupForm: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validador customizado para confirmar senhas
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.error = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    this.loading = true;
    this.error = '';
    const { email, password } = this.signupForm.value;

    console.log('📝 Iniciando signup com email:', email);
    
    this.authService.signup(email, password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          console.log('✅ Signup bem-sucedido! Redirecionando para login.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('❌ Erro no signup:', error);
          this.handleSignupError(error);
        }
      });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  private handleSignupError(error: any) {
    const errorCode = error?.code || error?.message || '';

    console.error('🔴 Firebase Error Code:', errorCode);

    switch (errorCode) {
      case 'auth/email-already-in-use':
        this.error = 'Este email já está registrado.';
        break;
      case 'auth/invalid-email':
        this.error = 'Email inválido.';
        break;
      case 'auth/weak-password':
        this.error = 'Senha fraca. Use pelo menos 6 caracteres.';
        break;
      default:
        this.error = error?.message || 'Erro ao criar conta. Tente novamente.';
    }
  }
}
