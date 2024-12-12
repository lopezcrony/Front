import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Role } from './roles.model';
import { AuthService } from '../../Auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(roles => console.log('Roles recibidos del servidor:', roles)),
      catchError(this.handleError)
    );
  }

  getOneRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createRoles(role: Role): Observable<Role> {
    console.log('Enviando rol al servidor:', role);
    return this.http.post<Role>(this.apiUrl, role, { headers: this.getHeaders() }).pipe(
      tap(createdRole => console.log('Rol creado en el servidor:', createdRole)),
      catchError(this.handleError)
    );
  }

  updateRoles(role: Role): Observable<Role> {
    console.log('Actualizando rol en el servidor:', role);
    return this.http.put<Role>(`${this.apiUrl}/${role.idRol}`, role, { headers: this.getHeaders() }).pipe(
      tap(updatedRole => console.log('Rol actualizado en el servidor:', updatedRole)),
      catchError(this.handleError)
    );
  }

  updateStatusRole(id: number, status: boolean): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, { estadoRol: status }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteRoles(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}