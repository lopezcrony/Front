import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [RouterOutlet, CommonModule], // Asegúrate de importar CommonModule aquí
  template: `
    <div class="main-container" [ngClass]="mainContainerClass">
      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./content.component.css']
})
export class ContentComponent {
  @Input() isSidebarVisible: boolean = true;

  get mainContainerClass() {
    return this.isSidebarVisible ? '' : 'expanded';
  }
}
