// topbar.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../Auth/auth.service';
import { RolesService } from '../../modules/roles/roles.service';
import { AlertsService} from '../../shared/alerts/alerts.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    OverlayPanelModule,
    ButtonModule,
    AvatarModule
  ],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})

export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  userData!: any;

  constructor(
    private authService: AuthService, 
    private roleService: RolesService,
    private alertService: AlertsService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      user: this.authService.getUserData(),
      roles: this.roleService.getAllRoles()
    }).subscribe({
      next: ({ user, roles }) => {
        const userRole = roles.find(r => r.idRol === user.idRol);
        this.userData = {
          ...user,
          nombreRol: userRole ? userRole.nombreRol : 'Rol no encontrado'
        };
      },
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  toggleSidebarVisibility() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.alertService.confirm('¿Estás seguro de cerrar sesión?', 
      () => { 
        this.authService.logout(); 
        this.preventBack(); 
      });
  }

  preventBack(): void {
    history.pushState(null, '', location.href);
    window.onpopstate = function () {
      history.go(1);
    };
  }
}