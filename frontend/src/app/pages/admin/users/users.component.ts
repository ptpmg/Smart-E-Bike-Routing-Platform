import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, User } from '../../../core/services/users.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  template: `
  <h2>Utilizadores</h2>
  <table mat-table [dataSource]="rows" class="mat-elevation-z1">
    <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let r">{{r.email}}</td></ng-container>
    <ng-container matColumnDef="role"><th mat-header-cell *matHeaderCellDef>Role</th><td mat-cell *matCellDef="let r">{{r.role}}</td></ng-container>
    <ng-container matColumnDef="active"><th mat-header-cell *matHeaderCellDef>Ativo</th><td mat-cell *matCellDef="let r">{{r.is_active ? 'Sim':'Não'}}</td></ng-container>
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Ações</th>
      <td mat-cell *matCellDef="let r">
        <button mat-button color="primary" (click)="toggle(r)">{{r.is_active?'Desativar':'Ativar'}}</button>
      </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="cols"></tr>
    <tr mat-row *matRowDef="let row; columns: cols;"></tr>
  </table>
  `,
  styles:[`table{width:100%}`]
})
export class UsersComponent {
  private api = inject(UsersService);
  rows: User[] = [];
  cols = ['email','role','active','actions'];
  ngOnInit(){ this.load(); }
  load(){ this.api.list().subscribe(r=> this.rows=r); }
  toggle(u: User){
    this.api.patch(u.id, { is_active: !u.is_active }).subscribe(()=> this.load());
  }
}
