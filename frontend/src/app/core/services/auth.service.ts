import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

type LoginDTO = { email: string; password: string; };
type AuthResponse = { user: any; token: string; };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storageKey = 'sb_token';

  getToken(): string | null { return localStorage.getItem(this.storageKey); }
  isLoggedIn(): boolean { return !!this.getToken(); }

  getRole(): 'user'|'admin'|null {
    const t = this.getToken(); if (!t) return null;
    try { const payload: any = jwtDecode(t); return payload.role || null; } catch { return null; }
  }

  getUserId(): string | null {
    const t = this.getToken();
    if (!t) return null;
    try { const p: any = jwtDecode(t); return p.sub || null; } catch { return null; }
  }


  login(dto: LoginDTO) {
    return this.http.post<AuthResponse>(`${environment.apiBase}/auth/login`, dto);
  }
  register(dto: LoginDTO) {
    return this.http.post<AuthResponse>(`${environment.apiBase}/auth/register`, dto);
  }
  saveAuth(resp: AuthResponse) {
    localStorage.setItem(this.storageKey, resp.token);
  }
  logout() {
    localStorage.removeItem(this.storageKey);
  }
}
