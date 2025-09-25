import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'sb-login',
  imports: [CommonModule, FormsModule],
  template: `
  <h2>Login</h2>
  <form (ngSubmit)="submit()">
    <label>Email <input [(ngModel)]="email" name="email" type="email" required></label>
    <label>Password <input [(ngModel)]="password" name="password" type="password" required></label>
    <button type="submit">Entrar</button>
    <p *ngIf="error" style="color:red">{{error}}</p>
  </form>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';

  submit() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (resp) => { this.auth.saveAuth(resp); this.router.navigate(['/']); },
      error: (err) => { this.error = err?.error?.error || 'Falha no login'; }
    });
  }
}
