import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh;">
      <h1 style="font-size: 3em; color: #d32f2f;">404</h1>
      <p style="font-size: 1.3em; color: #555;">Página não encontrada</p>
      <a routerLink="/dashboard">
        <button mat-raised-button color="primary">Voltar ao Dashboard</button>
      </a>
    </div>
  `
})
export class NotFoundComponent {}
