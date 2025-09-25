import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesService, RouteItem } from '../../../core/services/routes.service';
import * as L from 'leaflet';

@Component({
  standalone: true,
  selector: 'sb-routes-list',
  imports: [CommonModule],
  template: `
  <h2>Rotas públicas</h2>
  <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>
  <ul>
    <li *ngFor="let r of items" (click)="open(r)">{{ r.name }} — {{ r.distance_m || 'n/a' }} m</li>
  </ul>
  `
})
export class ListComponent implements AfterViewInit {
  private api = inject(RoutesService);
  items: RouteItem[] = [];
  private map!: L.Map;

  ngAfterViewInit() {
    this.map = L.map('map').setView([41.3, -7.73], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'©OSM' }).addTo(this.map);

    this.api.list({ visibility: 'public', limit: 20 }).subscribe(res => {
      this.items = res.items;
      // Opcional: tentar centralizar no 1º ponto de cada rota via GET /points
    });
  }

  open(r: RouteItem) {
    // routerLink para detalhe se preferires
    console.log('abrir rota', r.id);
  }
}
