import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'sb-login',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <mat-card>
    <h2>Login</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email">
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" type="password">
      </mat-form-field>
      <button mat-raised-button color="primary" [disabled]="form.invalid">Entrar</button>
      <span style="color:red;margin-left:8px" *ngIf="err">{{err}}</span>
    </form>
  </mat-card>
  `,
  styles:[`.w-100{width:100%}`]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  err = '';
  form = this.fb.group({ email:['',[Validators.required,Validators.email]], password:['',[Validators.required,Validators.minLength(6)]] });
  submit(){
    this.auth.login(this.form.value as any).subscribe({
      next: r => { this.auth.saveAuth(r); this.router.navigate(['/']); },
      error: e => this.err = e?.error?.error ?? 'Falha no login'
    });
  }
}
