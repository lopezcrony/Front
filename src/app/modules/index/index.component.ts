import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    RouterModule
  ],
  template: `
    <div class="welcome-message">
      <h1>Bienvenido a ComerciPlus</h1>
      <p>Selecciona una opción para comenzar</p>
    </div>

  <div class="panel-principal">
    <div class="card" *ngFor="let item of items" [routerLink]="item.link" [ngStyle]="{'--hover-color': item.color}">
      <div class="icon-wrapper" [ngStyle]="{'border-color': item.color}">
        <i [class]="item.icon" [ngStyle]="{'color': item.color}"></i>
      </div>
      <h2>{{ item.title }}</h2>
      <p>{{ item.description }}</p>
    </div>
  </div>

`,
  styleUrls: ['./index.component.css']

})
export class IndexComponent {
  items = [
    { title: 'Productos', description: 'Gestionar inventario y precios', icon: 'pi pi-box', color: '#007ad9', link: '/products' },
    { title: 'Ventas', description: 'Registrar y gestionar ventas', icon: 'pi pi-dollar', color: '#28a745', link: '/sales' },
    { title: 'Compras', description: 'Gestionar pedidos y proveedores', icon: 'pi pi-shopping-cart', color: '#ffc107', link: '/shoppingview' },
    { title: 'Categorías', description: 'Organizar productos por categorías', icon: 'pi pi-tags', color: '#17a2b8', link: '/categories' },
    { title: 'Devoluciones', description: 'Gestionar devoluciones y reembolsos', icon: 'pi pi-refresh', color: '#7B1FA2', link: '/returnSale' },
    { title: 'Dashboard', description: 'Ajustes del sistema', icon: 'pi pi-chart-bar', color: '#C62828', link: '/dashboard' }
  ];

}