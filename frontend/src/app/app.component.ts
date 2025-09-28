import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,            
    RouterOutlet, RouterLink,
    MatToolbarModule, MatSidenavModule, MatListModule, MatButtonModule
  ],
  styles: [`
    .shell { height: 100vh; }
    mat-sidenav { width: 260px; }
    .spacer { flex: 1 1 auto; }
  `],
  template: `
  <mat-toolbar color="primary">
    <button mat-button (click)="opened = !opened">☰</button>
    <span>Smart E-Bike</span>
    <span class="spacer"></span>
    <button *ngIf="!auth.isLoggedIn()" mat-button routerLink="/login">Login</button>
    <button *ngIf="!auth.isLoggedIn()" mat-stroked-button routerLink="/register">Registar</button>
    <button *ngIf="auth.isLoggedIn()" mat-stroked-button (click)="logout()">Logout</button>
  </mat-toolbar>

  <mat-sidenav-container class="shell">
    <mat-sidenav mode="side" [(opened)]="opened">
      <mat-nav-list>
        <a mat-list-item routerLink="/">Dashboard</a>
        <a mat-list-item routerLink="/routes">Rotas</a>
        <a mat-list-item routerLink="/routes/new">Nova rota</a>
        <a mat-list-item routerLink="/stats">Estatísticas</a>
        <ng-container *ngIf="auth.getRole()==='admin'">
          <h3 matSubheader>Admin</h3>
          <a mat-list-item routerLink="/admin/users">Utilizadores</a>
          <a mat-list-item routerLink="/admin/routes">Rotas</a>
        </ng-container>
      </mat-nav-list>
    </mat-sidenav>
    <mat-sidenav-content style="padding:16px"><router-outlet></router-outlet></mat-sidenav-content>
  </mat-sidenav-container>
  `
})
export class AppComponent {
  opened = true;
  auth = inject(AuthService);
  private router = inject(Router);
  logout(){ this.auth.logout(); this.router.navigate(['/login']); }
}
