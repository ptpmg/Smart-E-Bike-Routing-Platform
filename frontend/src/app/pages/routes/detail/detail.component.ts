import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoutesService, RouteItem, RoutePoint } from '../../../core/services/routes.service';
import * as L from 'leaflet';

@Component({
  standalone: true,
  imports: [CommonModule],
  styles:[`#map{height:420px;border-radius:8px;overflow:hidden;margin-bottom:12px}`],
  template: `
    <h2>{{route?.name}}</h2>
    <div id="map"></div>
    <pre *ngIf="route">{{ route | json }}</pre>
  `
})
export class DetailComponent {
  private routeParam = inject(ActivatedRoute);
  private api = inject(RoutesService);
  route?: RouteItem;
  map!: L.Map;

  async ngOnInit() {
    const id = this.routeParam.snapshot.paramMap.get('id')!;
    this.route = await this.api.get(id).toPromise();
    setTimeout(()=> this.initMap(id), 0);
  }

  private async initMap(id: string){
    const pts = await this.api.getPoints(id).toPromise();

    // 👉 garantir o tipo correto
    let center: L.LatLngTuple = pts && pts.length
      ? [pts[0].lat as number, pts[0].lon as number]
      : [41.3, -7.73];

    this.map = L.map('map').setView(center, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution:'©OSM' }).addTo(this.map);

    if (pts && pts.length) {
      const latlngs: L.LatLngTuple[] = pts
        .sort((a,b) => a.seq - b.seq)
        .map(p => [p.lat as number, p.lon as number] as L.LatLngTuple);

      const line = L.polyline(latlngs).addTo(this.map);
      this.map.fitBounds(line.getBounds(), { padding: [20, 20] });
    }
  }
}
