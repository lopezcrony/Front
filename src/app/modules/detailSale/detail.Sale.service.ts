import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DetailSale } from './detailSale.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DetailSalesService {
  private apiUrl = `${environment.apiUrl}/detalleventa`;

  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  createDetailSale(saleData: any): Observable<any> {
    return this.http.post<DetailSale>(this.apiUrl, saleData, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getDetailSale(): Observable<DetailSale[]> {
    return this.http.get<DetailSale[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getDetailSaleByidSale(idSale: number): Observable<DetailSale[]> {
    return this.http.get<DetailSale[]>(`${this.apiUrl}/venta/${idSale}`).pipe(
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