import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

/**
 * Auth Adapter Service
 * 
 * Fornece um layer que alterna entre:
 * - Mock Authentication (local storage)
 * - Firebase Real Authentication
 * 
 * Útil para desenvolvimento enquanto Firebase Auth é configurado
 */
@Injectable({ providedIn: 'root' })
export class AuthAdapterService {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // ⚠️ MUDE PARA FALSE QUANDO FIREBASE AUTH ESTIVER HABILITADO
  private USE_MOCK_AUTH = true;
  
  // Credenciais de teste para mock
  private MOCK_EMAIL = 'user@taskflow.com';
  private MOCK_PASSWORD = '123456';
  
  // Storage para usuários registrados
  private USERS_STORAGE_KEY = 'mockUsers';

  constructor() {
    this.initializeTestUser();
  }

  /**
   * Inicializar usuário de teste
   */
  private initializeTestUser(): void {
    const users = this.getAllUsers();
    const testUserExists = users.some(u => u.email === this.MOCK_EMAIL);
    
    if (!testUserExists) {
      this.saveUser({
        uid: 'mock-user',
        email: this.MOCK_EMAIL,
        password: this.MOCK_PASSWORD
      });
    }
  }

  /**
   * Obter todos os usuários registrados
   */
  private getAllUsers(): any[] {
    const stored = localStorage.getItem(this.USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Salvar novo usuário
   */
  private saveUser(user: { uid: string; email: string; password: string }): void {
    const users = this.getAllUsers();
    const exists = users.some(u => u.email === user.email);
    if (!exists) {
      users.push(user);
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  /**
   * Verificar credenciais
   */
  private validateCredentials(email: string, password: string): any {
    const users = this.getAllUsers();
    return users.find(u => u.email === email && u.password === password);
  }

  /**
   * Signup - Registrar novo usuário
   */
  signup(email: string, password: string): Observable<any> {
    if (this.USE_MOCK_AUTH) {
      // Simular validação
      if (!email || !password) {
        console.log('❌ Email ou password vazio');
        return of(null);
      }
      
      if (password.length < 6) {
        console.log('❌ Senha muito curta');
        return of(null);
      }

      // Verificar se usuário já existe
      const users = this.getAllUsers();
      if (users.some(u => u.email === email)) {
        console.log('❌ Usuário já existe:', email);
        return of(null).pipe(delay(500)); // Usuário já existe
      }

      // Mock: Criar usuário e salvar em localStorage
      const newUser = {
        uid: 'mock-user-' + Date.now(),
        email: email,
        password: password // Salvar a senha para login
      };

      console.log('📝 Registrando novo usuário:', email);

      return of({
        user: {
          uid: newUser.uid,
          email: email,
          emailVerified: false
        }
      }).pipe(
        delay(500),
        tap((result) => {
          if (result) {
            console.log('💾 Salvando usuário em localStorage...');
            this.saveUser(newUser);
            localStorage.setItem('mockAuth', JSON.stringify({ 
              uid: newUser.uid,
              email: email,
              timestamp: new Date().toISOString()
            }));
            console.log('✅ Usuário salvo! mockAuth=', localStorage.getItem('mockAuth'));
            // NÃO navegar aqui - deixar o componente fazer
          }
        })
      );
    } else {
      // Usar Firebase real
      return this.authService.signup(email, password);
    }
  }

  /**
   * Login - Fazer login
   */
  login(email: string, password: string): Observable<any> {
    if (this.USE_MOCK_AUTH) {
      // Validar credenciais no localStorage
      const user = this.validateCredentials(email, password);
      
      if (user) {
        // ✅ Credenciais válidas
        console.log('🔐 Credenciais válidas encontradas:', user.email);
        
        return of({
          user: {
            uid: user.uid,
            email: user.email,
            emailVerified: false
          }
        }).pipe(
          delay(500),
          tap((result) => {
            console.log('💾 Salvando em localStorage...');
            localStorage.setItem('mockAuth', JSON.stringify({ 
              uid: user.uid,
              email: user.email,
              timestamp: new Date().toISOString()
            }));
            console.log('✅ Salvado! mockAuth=', localStorage.getItem('mockAuth'));
            // NÃO navegar aqui - deixar o componente fazer
          })
        );
      } else {
        // ❌ Credenciais inválidas
        console.log('❌ Credenciais inválidas - email:', email);
        return of(null).pipe(delay(500));
      }
    } else {
      // Usar Firebase real
      return this.authService.login(email, password);
    }
  }

  /**
   * Logout - Fazer logout
   */
  logout(): Observable<void> {
    if (this.USE_MOCK_AUTH) {
      localStorage.removeItem('mockAuth');
      this.router.navigate(['/login']);
      return of(void 0);
    } else {
      return this.authService.logout();
    }
  }

  /**
   * Obter user atual
   */
  getCurrentUser(): any {
    if (this.USE_MOCK_AUTH) {
      const mockAuth = localStorage.getItem('mockAuth');
      return mockAuth ? JSON.parse(mockAuth) : null;
    } else {
      return this.authService.getCurrentUser();
    }
  }

  /**
   * Verificar se está logado
   */
  isLoggedIn(): boolean {
    if (this.USE_MOCK_AUTH) {
      const mockAuth = localStorage.getItem('mockAuth');
      const result = !!mockAuth;
      console.log('🔍 isLoggedIn() chamado - mockAuth:', mockAuth, '-> resultado:', result);
      return result;
    } else {
      return !!this.authService.getCurrentUser();
    }
  }

  /**
   * Obter userId
   */
  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.uid || null;
  }

  /**
   * Info do modo atual (para debug)
   */
  getAuthMode(): 'mock' | 'firebase' {
    return this.USE_MOCK_AUTH ? 'mock' : 'firebase';
  }
}
