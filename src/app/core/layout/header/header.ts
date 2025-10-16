import { Component } from '@angular/core';
import { AuthService } from '../../../features/auth/auth.service';
import { Observable } from 'rxjs';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  imports: [MaterialImportsModule, DatePipe, MatToolbarModule]
})
export class Header {
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  logout() {
    this.authService.logout();
  }
}