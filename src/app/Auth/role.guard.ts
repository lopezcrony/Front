import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { RolesService } from '../modules/roles/roles.service';
import { Observable, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const allowedRoles = route.data['roles'] as string[];
    const userRoleId = this.authService.getUserRoleId();

    console.log('Verificando acceso:');
    console.log('ID del rol del usuario:', userRoleId);
    console.log('Roles permitidos:', allowedRoles);

    if (!allowedRoles || userRoleId === null) {
      console.log('No hay roles permitidos o ID de rol es null');
      this.router.navigate(['/login']);
      return from([false]);
    }

    return this.rolesService.getOneRole(userRoleId).pipe(
      tap(roleResponse => {
        console.log('Respuesta del servicio de roles:', roleResponse);
      }),
      map(roleResponse => {
        const roleName = roleResponse.nombreRol;

        if (allowedRoles.includes(roleName)) {
          return true;
        } else {
          this.toastr.error('No tienes permisos para acceder a esta sección', 'Acceso Denegado');
          this.router.navigate(['/index']);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error al obtener el rol:', error);
        this.toastr.error('Error al verificar permisos');
        this.router.navigate(['/login']);
        return from([false]);
      })
    );
  }
}