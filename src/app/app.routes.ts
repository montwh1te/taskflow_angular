import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { AuthGuard } from './features/auth/auth-guard';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { ProjectListComponent } from './features/projects/project-list/project-list';
import { ProjectDetailComponent } from './features/projects/project-detail/project-detail';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent, // Um layout com header e sidebar
    canActivate: [AuthGuard],      // Protege todas as rotas filhas
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'projetos', component: ProjectListComponent },
      { path: 'projetos/:id', component: ProjectDetailComponent },
    ]
  },
  { path: '**', redirectTo: 'login' } // Rota coringa
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }