import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MockApiService } from '../../core/services/mock-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private mockApi: MockApiService, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  login(email: string, password: string) {
    return this.mockApi.login(email, password).pipe(
      // Esta parte agora funcionará corretamente
      tap(response => {
        if (response?.token) {
          localStorage.setItem('authToken', response.token);
          this._isLoggedIn$.next(true);
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('authToken');
    this._isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }
}