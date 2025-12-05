import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthAdapterService } from '../../../features/auth/auth-adapter.service';
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
  private authAdapter = inject(AuthAdapterService);
  private router = inject(Router);
  isLoggedIn = false;

  ngOnInit() {
    // Verificar estado de login ao inicializar
    this.isLoggedIn = this.authAdapter.isLoggedIn();
    console.log('🔐 Header inicializado - isLoggedIn:', this.isLoggedIn);
  }

  logout() {
    console.log('🚪 Logout clickado');
    this.authAdapter.logout().subscribe(() => {
      console.log('✅ Logout concluído - redirecionando para login');
      this.isLoggedIn = false;
      this.router.navigate(['/login']).then(success => {
        console.log('✅ Redirecionado para login:', success);
      }).catch(err => {
        console.error('❌ Erro ao redirecionar:', err);
      });
    });
  }
}
