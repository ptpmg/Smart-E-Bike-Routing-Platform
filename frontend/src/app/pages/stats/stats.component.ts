import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesService } from '../../core/services/routes.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
  <h2>Estatísticas</h2>
  <div class="cards">
    <mat-card><h3>Total de rotas</h3><p>{{count}}</p></mat-card>
    <mat-card><h3>Distância total</h3><p>{{totalKm | number:'1.0-1'}} km</p></mat-card>
    <mat-card><h3>CO₂ poupado</h3><p>{{co2Kg | number:'1.0-1'}} kg</p></mat-card>
  </div>
  `,
  styles:[`.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px} mat-card{padding:16px}`]
})
export class StatsComponent {
  private api = inject(RoutesService);
  count=0; totalKm=0; co2Kg=0;

  ngOnInit(){
    this.api.list({ mine:true, limit:200 }).subscribe(r=>{
      this.count = r.items.length;
      const totalM = r.items.reduce((s,x)=> s + (x.distance_m||0), 0);
      this.totalKm = totalM/1000;
      this.co2Kg = this.totalKm * 0.21;
    });
  }
}
