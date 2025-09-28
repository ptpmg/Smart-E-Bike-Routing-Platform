import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-draw';
import { firstValueFrom } from 'rxjs';
import { RoutesService } from '../../../core/services/routes.service';

@Component({
  standalone: true,
  selector: 'sb-route-editor',
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    #map { height: 420px; border-radius: 8px; margin: 12px 0; background:#eee; }
    form { display:grid; gap:10px; max-width: 680px; }
    label { display:flex; flex-direction:column; gap:4px; }
  `],
  template: `
    <h2>{{ isEdit ? 'Editar rota' : 'Nova rota' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Nome <input formControlName="name" required /></label>
      <label>Descrição <textarea formControlName="description"></textarea></label>
      <label>Distância (m) <input type="number" formControlName="distance_m" /></label>
      <label>Desnível (m) <input type="number" formControlName="elevation_gain_m" /></label>
      <label>Dificuldade
        <select formControlName="difficulty">
          <option value="easy">easy</option>
          <option value="moderate">moderate</option>
          <option value="hard">hard</option>
        </select>
      </label>
      <label>Visibilidade
        <select formControlName="visibility">
          <option value="private">private</option>
          <option value="unlisted">unlisted</option>
          <option value="public">public</option>
        </select>
      </label>
      <label><input type="checkbox" formControlName="is_loop" /> Rota circular</label>

      <div id="map"></div>

      <div style="display:flex; gap:8px;">
        <button type="submit" [disabled]="form.invalid">{{ isEdit ? 'Guardar' : 'Criar' }}</button>
        <button type="button" (click)="cancel()">Cancelar</button>
      </div>
      <p *ngIf="err" style="color:red">{{err}}</p>
    </form>
  `
})
export class EditorComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ar = inject(ActivatedRoute);
  private api = inject(RoutesService);

  isEdit = false;
  routeId: string | null = null;
  err = '';

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    distance_m: [null as number | null],
    elevation_gain_m: [null as number | null],
    difficulty: ['moderate', Validators.required],
    visibility: ['private', Validators.required],
    is_loop: [false]
  });

  map!: L.Map;
  drawn = new L.FeatureGroup();

  async ngAfterViewInit() {
    // 1) identificar se é edição
    this.routeId = this.ar.snapshot.paramMap.get('id');
    this.isEdit = !!this.routeId;

    // 2) inicializar mapa DEPOIS do template existir
    this.map = L.map('map').setView([41.3, -7.73], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'©OSM' }).addTo(this.map);
    this.map.addLayer(this.drawn);

    const draw = new (L as any).Control.Draw({
      edit: { featureGroup: this.drawn },
      draw: { polyline: true, polygon: false, rectangle: false, circle: false, circlemarker: false, marker: false }
    });
    this.map.addControl(draw);
    this.map.on((L as any).Draw.Event.CREATED, (e: any) => { this.drawn.clearLayers(); this.drawn.addLayer(e.layer); });

    // 3) se for edição, carregar dados
    if (this.isEdit && this.routeId) {
      const r = await firstValueFrom(this.api.get(this.routeId));
      this.form.patchValue({
        name: r.name, description: r.description || '',
        distance_m: r.distance_m || null, elevation_gain_m: r.elevation_gain_m || null,
        difficulty: r.difficulty, visibility: r.visibility, is_loop: r.is_loop
      });
      const pts = await firstValueFrom(this.api.getPoints(this.routeId));
      if (pts?.length) {
        const latlngs = pts.sort((a:any,b:any)=>a.seq-b.seq).map((p:any)=>[p.lat,p.lon]) as [number,number][];
        const line = L.polyline(latlngs);
        this.drawn.addLayer(line);
        this.map.fitBounds(line.getBounds(), { padding:[20,20] });
      }
    }
  }

  private getLatLngs(): [number,number][] {
    const layer = this.drawn.getLayers()[0] as L.Polyline | undefined;
    if (!layer) return [];
    return (layer.getLatLngs() as L.LatLng[]).map(ll => [ll.lat, ll.lng]);
  }

  async save() {
    this.err = '';
    const points = this.getLatLngs().map((p, i) => ({ lat: p[0], lon: p[1], elevation_m: null, seq: i }));
    try {
      if (!this.isEdit) {
        const created = await firstValueFrom(this.api.create({ ...(this.form.value as any), points }));
        this.router.navigate(['/routes', created.id]);
      } else if (this.routeId) {
        await firstValueFrom(this.api.update(this.routeId, this.form.value as any));
        await firstValueFrom(this.api.replacePoints(this.routeId, points));
        this.router.navigate(['/routes', this.routeId]);
      }
    } catch (e:any) {
      this.err = e?.error?.error || 'Erro ao guardar rota';
    }
  }

  cancel(){ this.router.navigate(['/routes']); }
}
