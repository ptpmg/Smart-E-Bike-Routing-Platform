import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesService, RouteItem } from '../../core/services/routes.service';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterLink],
  template: `
  <h2>As minhas rotas</h2>
  <div class="grid">
    <mat-card *ngFor="let r of items" [routerLink]="['/routes', r.id]" class="card">
      <mat-card-title>{{r.name}}</mat-card-title>
      <mat-card-content>
        <div>Distância: {{r.distance_m || '—'}} m</div>
        <div>Desnível: {{r.elevation_gain_m || '—'}} m</div>
        <div>Dificuldade: {{r.difficulty}}</div>
        <div>Visibilidade: {{r.visibility}}</div>
      </mat-card-content>
    </mat-card>
  </div>
  `,
  styles:[`.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))} .card{cursor:pointer}`]
})
export class DashboardComponent {
  private api = inject(RoutesService);
  items: RouteItem[] = [];
  ngOnInit(){ this.api.list({ mine:true, limit:50 }).subscribe(r => this.items = r.items); }
}
