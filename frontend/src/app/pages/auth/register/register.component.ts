import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'sb-register',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Registar</h2>
    <form (ngSubmit)="submit()">
      <label>Email <input [(ngModel)]="email" name="email" type="email" required></label>
      <label>Password <input [(ngModel)]="password" name="password" type="password" required></label>
      <button type="submit">Criar conta</button>
    </form>
    <p *ngIf="msg" style="color:green">{{msg}}</p>
    <p *ngIf="err" style="color:red">{{err}}</p>
  `
})
export class RegisterComponent {
  email = ''; password = ''; msg = ''; err = '';
  constructor(private http: HttpClient) {}
  submit() {
    this.http.post<any>(`${environment.apiBase}/auth/register`, { email: this.email, password: this.password })
      .subscribe({
        next: (r) => { localStorage.setItem('sb_token', r.token); this.msg = 'Conta criada'; this.err=''; },
        error: (e) => { this.err = e?.error?.error || 'Erro'; this.msg=''; }
      });
  }
}
