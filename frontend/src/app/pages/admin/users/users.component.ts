import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'sb-admin-users',
  imports: [CommonModule],
  template: `
    <h2>Utilizadores (admin)</h2>
    <ul>
      <li *ngFor="let u of users">{{u.email}} — {{u.role}}</li>
    </ul>
    <p *ngIf="err" style="color:red">{{err}}</p>
  `
})
export class UsersComponent {
  private http = inject(HttpClient);
  users: any[] = []; err = '';
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiBase}/api/users`).subscribe({
      next: (r) => this.users = r,
      error: (e) => this.err = e?.error?.error || 'Erro (precisa de token admin?)'
    });
  }
}
