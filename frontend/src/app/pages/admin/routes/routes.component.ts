import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesService, RouteItem } from '../../../core/services/routes.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone:true,
  imports:[CommonModule, MatTableModule, MatButtonModule],
  template:`
  <h2>Rotas (admin)</h2>
  <table mat-table [dataSource]="rows" class="mat-elevation-z1">
    <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Nome</th><td mat-cell *matCellDef="let r">{{r.name}}</td></ng-container>
    <ng-container matColumnDef="owner"><th mat-header-cell *matHeaderCellDef>Owner</th><td mat-cell *matCellDef="let r">{{r.owner_id}}</td></ng-container>
    <ng-container matColumnDef="visibility"><th mat-header-cell *matHeaderCellDef>Visibilidade</th><td mat-cell *matCellDef="let r">{{r.visibility}}</td></ng-container>
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Ações</th>
      <td mat-cell *matCellDef="let r"><button mat-button color="warn" (click)="remove(r)">Apagar</button></td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="cols"></tr>
    <tr mat-row *matRowDef="let row; columns: cols;"></tr>
  </table>
  `
})
export class AdminRoutesComponent {
  private api = inject(RoutesService);
  rows: RouteItem[] = [];
  cols = ['name','owner','visibility','actions'];
  ngOnInit(){ this.api.list({ limit:200 }).subscribe(r=> this.rows = r.items); }
  remove(r: RouteItem){ this.api.remove(r.id).subscribe(()=> this.ngOnInit()); }
}
