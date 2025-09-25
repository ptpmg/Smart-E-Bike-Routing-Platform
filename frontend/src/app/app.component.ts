import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header style="padding:8px;border-bottom:1px solid #eee">
      <strong>Smart E-Bike</strong>
    </header>
    <main style="padding:16px">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {}
