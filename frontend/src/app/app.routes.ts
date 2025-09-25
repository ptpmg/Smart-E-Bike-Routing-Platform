import { authGuard, adminGuard } from './core/guards/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'routes', loadComponent: () => import('./pages/routes/list/list.component').then(m => m.ListComponent) },
  { path: 'routes/:id', loadComponent: () => import('./pages/routes/detail/detail.component').then(m => m.DetailComponent) },
  { path: 'admin/users', loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent) },
  { path: '**', redirectTo: '' }
];
