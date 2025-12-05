import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { SignupComponent } from './features/auth/signup/signup';
import { authGuard } from './features/auth/auth-guard';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { ProjectListComponent } from './features/projects/project-list/project-list';
import { ProjectDetailComponent } from './features/projects/project-detail/project-detail';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'projects', component: ProjectListComponent, canActivate: [authGuard] },
      { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [authGuard] },
    ]
  },
  { path: '**', redirectTo: '/login' }
];