import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, authState } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Observable do estado de autenticação do Firebase
  authState$ = authState(this.auth);

  // Observable derivado para verificar se está logado
  isLoggedIn$ = this.authState$.pipe(
    map(user => !!user)
  );

  // Observable para obter o userId
  userId$ = this.authState$.pipe(
    map(user => user?.uid || null)
  );

  /**
   * Login com email e senha
   */
  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then(credential => {
          observer.next(credential.user);
          observer.complete();
          this.router.navigate(['/dashboard']);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Registro de novo usuário
   */
  signup(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then(credential => {
          observer.next(credential.user);
          observer.complete();
          this.router.navigate(['/dashboard']);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Logout
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      signOut(this.auth)
        .then(() => {
          observer.next();
          observer.complete();
          this.router.navigate(['/login']);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Obtém o usuário atual (síncrono)
   */
  getCurrentUser() {
    return this.auth.currentUser;
  }
}