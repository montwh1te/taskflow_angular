import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthAdapterService } from '../auth-adapter.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { MaterialImportsModule } from '../../../material-imports.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, MaterialImportsModule, ReactiveFormsModule, MatProgressSpinnerModule, RouterLink],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authAdapter = inject(AuthAdapterService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  error = '';
  authMode = '';
  testCredentials = 'user@taskflow.com / 123456';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Mostrar qual modo está ativo
    this.authMode = this.authAdapter.getAuthMode();
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;

    this.authAdapter.login(email, password)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (result) => {
          console.log('✅ Login retornou:', result);
          if (result && result.user) {
            // ✅ Login bem-sucedido
            console.log('✅ Credenciais aceitas, aguardando 300ms antes de redirecionar');
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
                console.log('❌ Não conseguiu fazer login! isLoggedIn falhou');
              }
            }, 300);
          } else {
            // ❌ Credenciais inválidas
            console.log('❌ Login falhou - credenciais inválidas');
            this.error = 'Email ou senha incorretos.';
          }
        },
        (error) => {
          console.error('❌ Login erro:', error);
          this.handleLoginError(error);
        }
      );
  }

  private handleLoginError(error: any) {
    const errorCode = error?.code;
    
    switch (errorCode) {
      case 'auth/invalid-email':
        this.error = 'Email inválido.';
        break;
      case 'auth/user-not-found':
        this.error = 'Usuário não encontrado.';
        break;
      case 'auth/wrong-password':
        this.error = 'Senha incorreta.';
        break;
      case 'auth/invalid-credential':
        this.error = 'Credenciais inválidas.';
        break;
      default:
        this.error = error?.message || 'Erro ao fazer login. Tente novamente.';
    }
  }
}