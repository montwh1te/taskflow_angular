import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthAdapterService } from '../auth-adapter.service';
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
  private authAdapter = inject(AuthAdapterService);
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
      return;
    }

    this.loading = true;
    this.error = '';
    const { email, password } = this.signupForm.value;

    this.authAdapter.signup(email, password)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (result) => {
          console.log('✅ Signup retornou:', result);
          if (result && result.user) {
            // ✅ Signup bem-sucedido
            console.log('✅ Usuário criado, aguardando 300ms antes de redirecionar');
            setTimeout(() => {
              console.log('⏱️  300ms passou, verificando localStorage antes de navegar');
              console.log('   mockAuth:', localStorage.getItem('mockAuth'));
              const isLogged = this.authAdapter.isLoggedIn();
              console.log('   isLoggedIn:', isLogged);
              if (isLogged) {
                console.log('🔄 Iniciando navegação manual para /dashboard');
                this.router.navigate(['/dashboard'], { replaceUrl: true }).then((success) => {
                  console.log('🎯 Router.navigate resultado:', success);
                  if (!success) {
                    console.error('❌ ERRO! Router.navigate retornou false');
                    console.log('   Tentando diagnóstico: verifica isLoggedIn() novamente');
                    console.log('   isLoggedIn():', this.authAdapter.isLoggedIn());
                  }
                });
              } else {
                console.log('❌ Não conseguiu fazer signup! isLoggedIn falhou');
              }
            }, 300);
          } else {
            // ❌ Erro no signup
            console.log('❌ Signup falhou');
            this.error = 'Erro ao criar conta. Tente novamente.';
          }
        },
        (error) => {
          console.error('❌ Signup erro:', error);
          this.handleSignupError(error);
        }
      );
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  private handleSignupError(error: any) {
    const errorCode = error?.code;

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
        this.error = 'Erro ao criar conta. Tente novamente.';
    }
  }
}
