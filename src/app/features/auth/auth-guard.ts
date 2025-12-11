import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseAuthService } from './firebase-auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  console.log('🛡️  AuthGuard - verificando acesso para:', state.url);
  
  return authService.isLoggedIn().pipe(
    take(1),
    map(isLoggedIn => {
      console.log('   isLoggedIn:', isLoggedIn);
      
      if (isLoggedIn) {
        console.log('✅ AuthGuard - Acesso PERMITIDO');
        return true;
      }
      
      console.log('❌ AuthGuard - Acesso NEGADO, redirecionando para /login');
      router.navigate(['/login']);
      return false;
    })
  );
};
