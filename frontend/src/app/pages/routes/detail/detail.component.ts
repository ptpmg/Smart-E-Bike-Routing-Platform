import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoutesService, RouteItem, RoutePoint } from '../../../core/services/routes.service';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'sb-route-detail',
  // 🔧 IMPORTA RouterLink para poderes usar [routerLink] no template
  imports: [CommonModule, RouterLink],
  styles:[`#map{height:420px;border-radius:8px;overflow:hidden;margin-bottom:12px}`],
  template: `
    <h2>{{ route?.name }}</h2>
    <div id="map"></div>

    <div style="margin:8px 0; display:flex; gap:8px;">
      <a [routerLink]="['/routes', route?.id, 'edit']"><button>Editar</button></a>
      <button *ngIf="route" (click)="toggleVisibility()">
        {{ (route!.visibility === 'public') ? 'Tornar privada' : 'Tornar pública' }}
      </button>

    </div>

    <pre *ngIf="route">{{ route | json }}</pre>
  `
})
export class DetailComponent {
  private routeParam = inject(ActivatedRoute);
  private api = inject(RoutesService);

  route?: RouteItem;
  map!: L.Map;

  async ngOnInit() {
    const id = this.routeParam.snapshot.paramMap.get('id')!;
    // ✅ usar firstValueFrom (substitui .toPromise)
    this.route = await firstValueFrom(this.api.get(id));
    // garante que o div #map já existe no DOM
    setTimeout(() => this.initMap(id), 0);
  }

  private async initMap(id: string) {
    const pts = await firstValueFrom(this.api.getPoints(id)) as RoutePoint[];

    // 👉 garantir o tipo correto para o centro
    const center: L.LatLngTuple = (pts && pts.length)
      ? [pts[0].lat as number, pts[0].lon as number]
      : [41.3, -7.73];

    this.map = L.map('map').setView(center, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '©OSM' }).addTo(this.map);

    if (pts && pts.length) {
      const latlngs: L.LatLngTuple[] = pts
        .sort((a, b) => a.seq - b.seq)
        .map(p => [p.lat as number, p.lon as number] as L.LatLngTuple);

      const line = L.polyline(latlngs).addTo(this.map);
      this.map.fitBounds(line.getBounds(), { padding: [20, 20] });
    }
  }

  async toggleVisibility() {
    if (!this.route) return;
    const newVis = this.route.visibility === 'public' ? 'private' : 'public';
    this.route = await firstValueFrom(this.api.update(this.route.id, { visibility: newVis }));
  }
}
