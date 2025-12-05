import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthAdapterService } from './auth-adapter.service';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authAdapter = inject(AuthAdapterService);
  const router = inject(Router);

  // Verificar se está logado via AuthAdapterService
  const isLoggedIn = authAdapter.isLoggedIn();
  console.log('🛡️  AuthGuard ENTROU - state.url:', state.url);
  console.log('   isLoggedIn:', isLoggedIn);
  console.log('   mockAuth:', localStorage.getItem('mockAuth'));
  
  if (isLoggedIn) {
    console.log('✅ AuthGuard - Acesso PERMITIDO para:', state.url);
    return true;
  }
  
  console.log('❌ AuthGuard - Acesso NEGADO, redirecionando para /login de:', state.url);
  router.navigate(['/login']);
  return false;
};

/**
 * Classe antiga para compatibilidade (deprecada em favor do authGuard funcional)
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    return this.authService.authState$.pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        }
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}