import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'sb-profile',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h2>O meu perfil</h2>
  <form [formGroup]="form" (ngSubmit)="save()">
    <label>Email
      <input formControlName="email" type="email" />
    </label>
    <label>Nova password
      <input formControlName="password" type="password" placeholder="(opcional)" />
    </label>
    <button type="submit" [disabled]="form.invalid">Guardar</button>
    <span *ngIf="msg" style="color:green;margin-left:8px">{{msg}}</span>
    <span *ngIf="err" style="color:red;margin-left:8px">{{err}}</span>
  </form>
  `
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private users = inject(UsersService);
  private auth = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['']
  });

  msg=''; err='';

  ngOnInit(){
    const id = this.auth.getUserId();
    if (!id) { this.err = 'Sessão expirada'; return; }
    this.users.get(id).subscribe({
      next: (u)=> { this.form.patchValue({ email: u.email }); },
      error: (e)=> this.err = e?.error?.error || 'Erro a carregar perfil'
    });
  }

  save(){
    const id = this.auth.getUserId();
    if (!id) return;
    const body: any = { email: this.form.value.email };
    if (this.form.value.password) body.password = this.form.value.password;

    this.users.patch(id, body).subscribe({
      next: ()=> { this.msg = 'Perfil atualizado'; this.err=''; },
      error: (e)=> { this.err = e?.error?.error || 'Erro a guardar'; this.msg=''; }
    });
  }
}
