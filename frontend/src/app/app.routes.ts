import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate:[authGuard] },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'routes', loadComponent: () => import('./pages/routes/list/list.component').then(m => m.ListComponent) },
  { path: 'routes/:id', loadComponent: () => import('./pages/routes/detail/detail.component').then(m => m.DetailComponent) },
  { path: 'stats', loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent), canActivate:[authGuard] },
  { path: 'admin/users', loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent), canActivate:[adminGuard] },
  { path: 'admin/routes', loadComponent: () => import('./pages/admin/routes/routes.component').then(m => m.AdminRoutesComponent), canActivate:[adminGuard] },
  { path: 'routes/new', loadComponent: () => import('./pages/routes/editor/editor.component').then(m => m.EditorComponent) },
  { path: 'routes/:id/edit', loadComponent: () => import('./pages/routes/editor/editor.component').then(m => m.EditorComponent) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },


  { path: '**', redirectTo: '' }
];
