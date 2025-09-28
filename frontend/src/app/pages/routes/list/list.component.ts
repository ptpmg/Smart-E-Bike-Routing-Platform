import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesService, RouteItem } from '../../../core/services/routes.service';
import * as L from 'leaflet';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'sb-routes-list',
  imports: [CommonModule, RouterLink],
  template: `
  <div style="display:flex;gap:8px;align-items:center; margin-bottom:8px;">
    <button (click)="mode='public'; load()">Públicas</button>
    <button (click)="mode='mine'; load()">Minhas</button>
    <span style="flex:1"></span>
    <a routerLink="/routes/new"><button>Nova rota</button></a>
  </div>

  <div id="map" style="height: 300px; margin-bottom: 1rem;"></div>

  <ul>
    <li *ngFor="let r of items" [routerLink]="['/routes', r.id]" style="cursor:pointer">
      {{ r.name }} — {{ r.distance_m || 'n/a' }} m — {{ r.visibility }}
    </li>
  </ul>
  `
})
export class ListComponent implements AfterViewInit {
  private api = inject(RoutesService);
  items: RouteItem[] = [];
  private map!: L.Map;
  mode: 'public'|'mine' = 'public';

  ngAfterViewInit() {
    this.map = L.map('map').setView([41.3, -7.73], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'©OSM' }).addTo(this.map);
    this.load();
  }

  load() {
    const params = this.mode === 'mine' ? { mine: true, limit: 50 } : { visibility: 'public', limit: 50 };
    this.api.list(params).subscribe(res => this.items = res.items);
  }
}
