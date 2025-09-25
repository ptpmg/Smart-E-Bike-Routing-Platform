import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'sb-route-detail',
  imports: [CommonModule],
  template: `
    <h2>Detalhe da rota</h2>
    <pre *ngIf="route">{{ route | json }}</pre>
  `
})
export class DetailComponent {
  private routeParam = inject(ActivatedRoute);
  private http = inject(HttpClient);
  route: any;

  ngOnInit() {
    const id = this.routeParam.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`${environment.apiBase}/api/routes/${id}`).subscribe((r) => this.route = r);
    }
  }
}
