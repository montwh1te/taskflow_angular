import { Injectable, inject } from '@angular/core';
import { Auth, signOut, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from, of, shareReplay } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  
  // Usar authState() diretamente do Firebase (mais confiável e em tempo real)
  currentUser$: Observable<FirebaseUser | null> = authState(this.auth).pipe(
    tap(u => console.log('🔐 Firebase Auth State:', u?.email || 'sem usuário')),
    shareReplay(1)
  );
  
  // Observable do userId
  userId$ = this.currentUser$.pipe(
    map(user => user?.uid || null),
    shareReplay(1)
  );

  signup(email: string, password: string): Observable<FirebaseUser | null> {
    console.log('📝 Firebase signup:', email);
    
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(result => {
        console.log('✅ Firebase signup bem-sucedido:', result.user.email);
      }),
      map(result => result.user),
      switchMap(() => from(signOut(this.auth)).pipe(
        tap(() => {
          console.log('ℹ️  Usuário deslogado após signup para fazer login');
          this.router.navigate(['/login']);
        }),
        map(() => null)
      )),
      catchError(error => {
        console.error('❌ Firebase signup erro:', error.message);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<FirebaseUser | null> {
    console.log('🔑 Firebase login:', email);
    
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(result => {
        console.log('✅ Firebase login bem-sucedido:', result.user.email);
      }),
      map(result => result.user),
      catchError(error => {
        console.error('❌ Firebase login erro:', error.message);
        throw error;
      })
    );
  }

  logout(): Observable<void> {
    console.log('🚪 Firebase logout');
    
    return from(signOut(this.auth)).pipe(
      tap(() => {
        console.log('✅ Firebase logout bem-sucedido');
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('❌ Firebase logout erro:', error.message);
        throw error;
      })
    );
  }

  getCurrentUser(): Observable<FirebaseUser | null> {
    return this.currentUser$;
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(u => !!u)
    );
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  getUserEmail(): string | null {
    return this.auth.currentUser?.email || null;
  }

  getIdToken(): Observable<string | null> {
    return this.currentUser$.pipe(
      switchMap(u => {
        if (!u) return of(null);
        return from(u.getIdToken());
      }),
      catchError(() => of(null))
    );
  }
}
