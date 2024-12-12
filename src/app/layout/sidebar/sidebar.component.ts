import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from '../../Auth/auth.service';
import { RolesService } from '../../modules/roles/roles.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('sidebarAnimation', [
      state('collapsed', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      state('expanded', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out')),
    ]),
    trigger('submenuAnimation', [
      state('closed', style({
        height: '0',
        opacity: '0',
      })),
      state('open', style({
        height: '*',
        opacity: '1'
      })),
      transition('closed <=> open', animate('300ms ease-in-out')),
    ])
  ],
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarVisible: boolean = true;
  @Output() sidebarClosed = new EventEmitter<void>();

  private activeSubmenu: string | null = null;
  userRole$ = new BehaviorSubject<string>('');

  constructor(
    private authService: AuthService,
    private rolesService: RolesService
  ) {
    this.loadUserRole();
  }

  ngOnInit() {
    // Recupera el estado del submenú del almacenamiento local al inicializar
    this.activeSubmenu = localStorage.getItem('activeSubmenu');
  }

  private loadUserRole() {
    const roleId = this.authService.getUserRoleId();
    if (roleId) {
      this.rolesService.getOneRole(roleId).subscribe(
        role => {
          this.userRole$.next(role.nombreRol);
        },
        error => {
          console.error('Error al cargar el rol:', error);
          this.userRole$.next('');
        }
      );
    }
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.userRole$.value);
  }

  isSubmenuOpen(submenu: string): boolean {
    return this.activeSubmenu === submenu;
  }

  toggleSubmenu(submenu: string) {
    if (this.activeSubmenu === submenu) {
      this.activeSubmenu = null;
    } else {
      this.activeSubmenu = submenu;
    }
    // Guarda el estado del submenú en el almacenamiento local
    localStorage.setItem('activeSubmenu', this.activeSubmenu || '');
  }

  getSubmenuState(submenu: string): string {
    return this.isSubmenuOpen(submenu) ? 'open' : 'closed';
  }

  closeSidebar() {
    this.sidebarClosed.emit();
  }
}
