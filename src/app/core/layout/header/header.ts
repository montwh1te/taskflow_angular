import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../../features/auth/firebase-auth.service';
import { MaterialImportsModule } from '../../../material-imports.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  imports: [MaterialImportsModule, MatToolbarModule, CommonModule]
})
export class Header implements OnInit {
  private authService = inject(FirebaseAuthService);
  private router = inject(Router);
  isLoggedIn = false;

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      console.log('🔐 Header - isLoggedIn:', this.isLoggedIn);
    });
  }

  logout() {
    console.log('🚪 Logout clickado');
    // Redirecionar e recarregar a página IMEDIATAMENTE
    this.isLoggedIn = false;
    this.router.navigate(['/login']).then(() => {
      // Forçar reload da página
      window.location.reload();
    }).catch(err => {
      console.error('❌ Erro ao redirecionar:', err);
      window.location.reload();
    });
    // Fazer logout em background
    this.authService.logout().subscribe(
      () => console.log('✅ Logout concluído no Firebase'),
      error => console.error('❌ Erro ao fazer logout no Firebase:', error)
    );
  }
}
