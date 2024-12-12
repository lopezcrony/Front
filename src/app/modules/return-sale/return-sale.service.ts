import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { ReturnSaleModel } from './return-sale.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReturnSaleService {
  private apiUrl = `${environment.apiUrl}/devolucionVentas`

  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  getReturnSale(): Observable<ReturnSaleModel[]> {
    return this.http.get<ReturnSaleModel[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getReturnSaleId(id: number): Observable<ReturnSaleModel> {
    return this.http.get<ReturnSaleModel>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createReturnSale(returSale: ReturnSaleModel): Observable<ReturnSaleModel> {
    return this.http.post<ReturnSaleModel>(this.apiUrl, returSale, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateStatusSale(id: number, status: boolean): Observable<ReturnSaleModel> {
    const body = { estado: status };

    return this.http.patch<ReturnSaleModel>(`${this.apiUrl}/${id}`, body, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  cancelSale(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`,{}, { headers: this.getHeaders() }).pipe(
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
