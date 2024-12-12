import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment'; 

import { returnProviderModel } from './return-provider.model'
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Auth/auth.service';
@Injectable({
  providedIn: 'root'
})
export class ReturnProviderService {
  private apiUrl= `${environment.apiUrl}/devolucionLocal`
  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) {}
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  getReturnProvider(): Observable<returnProviderModel[]> {
      return this.http.get<returnProviderModel[]>(this.apiUrl).pipe(
        catchError(this.handleError)
      );
    }
  
  
    getReturnProviderById(id: number): Observable<returnProviderModel> {
      return this.http.get<returnProviderModel>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.handleError)
      );
    }
  
    createReturnProvider(returnProvider: returnProviderModel): Observable<returnProviderModel> {
      return this.http.post<returnProviderModel>(this.apiUrl, returnProvider, { headers: this.getHeaders() }).pipe(
        catchError(this.handleError)
      );
    }

    updateStatusReturnProvider(id: number, status: string): Observable<returnProviderModel> {
      const body = { estado: status };
      
      return this.http.patch<returnProviderModel>(`${this.apiUrl}/${id}`, body, { headers: this.getHeaders() }).pipe(
        catchError(this.handleError)
      );
    }

    private handleError(error: HttpErrorResponse) {
      // Puedes ajustar la lógica para diferentes tipos de errores aquí
      let errorMessage = 'Algo salió mal; por favor, intente nuevamente más tarde.';
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        errorMessage = error.error?.message || errorMessage;
      }
      return throwError(() => new Error(errorMessage));
    }
   }

