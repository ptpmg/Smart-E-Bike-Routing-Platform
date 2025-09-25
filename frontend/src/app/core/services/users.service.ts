import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type User = { id: string; email: string; role: 'user'|'admin'; is_active: boolean; };

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  list() { return this.http.get<User[]>(`${environment.apiBase}/api/users`); } // admin only
  get(id: string) { return this.http.get<User>(`${environment.apiBase}/api/users/${id}`); }
  patch(id: string, body: Partial<Pick<User,'email'|'is_active'>>) {
    return this.http.patch<User>(`${environment.apiBase}/api/users/${id}`, body);
  }
}
