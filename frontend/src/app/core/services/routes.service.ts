import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type RouteItem = {
  id: string; owner_id: string; name: string; description?: string|null;
  distance_m?: number|null; elevation_gain_m?: number|null;
  difficulty: 'easy'|'moderate'|'hard';
  visibility: 'private'|'unlisted'|'public';
  is_loop: boolean; created_at: string; updated_at: string;
};

export type RoutePoint = { id?: number; seq: number; lat: number; lon: number; elevation_m?: number|null; };

@Injectable({ providedIn: 'root' })
export class RoutesService {
  private http = inject(HttpClient);
  list(params?: { visibility?: string; mine?: boolean; limit?: number; offset?: number; }) {
    const q = new URLSearchParams();
    if (params?.visibility) q.set('visibility', params.visibility);
    if (params?.mine) q.set('mine', '1');
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.http.get<{items: RouteItem[], limit: number, offset: number}>(`${environment.apiBase}/api/routes${qs}`);
  }
  get(id: string) { return this.http.get<RouteItem>(`${environment.apiBase}/api/routes/${id}`); }
  create(body: Partial<RouteItem> & { name: string; points?: Omit<RoutePoint,'seq'|'id'>[] }) {
    return this.http.post<RouteItem>(`${environment.apiBase}/api/routes`, body);
  }
  update(id: string, body: Partial<RouteItem>) {
    return this.http.patch<RouteItem>(`${environment.apiBase}/api/routes/${id}`, body);
  }
  remove(id: string) { return this.http.delete<void>(`${environment.apiBase}/api/routes/${id}`); }
  getPoints(id: string) { return this.http.get<RoutePoint[]>(`${environment.apiBase}/api/routes/${id}/points`); }
  replacePoints(id: string, points: Omit<RoutePoint,'seq'|'id'>[]) {
    return this.http.put<void>(`${environment.apiBase}/api/routes/${id}/points`, { points });
  }
}
