import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseAuthService } from '../firebase-auth.service';
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
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(FirebaseAuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Se já está logado, redirecionar para dashboard
    this.authService.isLoggedIn().subscribe(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.error = 'Por favor, preencha os campos corretamente.';
      return;
    }

    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;

    console.log('🔑 Iniciando login com email:', email);
    
    this.authService.login(email, password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (user) => {
          console.log('✅ Login bem-sucedido:', user?.email);
          this.router.navigate(['/dashboard']).then(success => {
            console.log('✅ Redirecionado para dashboard:', success);
          });
        },
        error: (error) => {
          console.error('❌ Erro no login:', error);
          this.handleLoginError(error);
        }
      });
  }

  private handleLoginError(error: any) {
    const errorCode = error?.code || error?.message || '';
    
    console.error('🔴 Firebase Error Code:', errorCode);
    
    switch (errorCode) {
      case 'auth/invalid-email':
        this.error = 'Email inválido.';
        break;
      case 'auth/user-not-found':
        this.error = 'Usuário não encontrado. Crie uma conta primeiro.';
        break;
      case 'auth/wrong-password':
        this.error = 'Senha incorreta.';
        break;
      case 'auth/invalid-credential':
        this.error = 'Email ou senha incorretos.';
        break;
      case 'auth/too-many-requests':
        this.error = 'Muitas tentativas de login. Tente mais tarde.';
        break;
      default:
        this.error = error?.message || 'Erro ao fazer login. Tente novamente.';
    }
  }
}
