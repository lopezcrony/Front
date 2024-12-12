import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Sale } from './sales.model';
import { DetailSale } from '../detailSale/detailSale.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  createSale(sale: any, saleDetail: DetailSale[]): Observable<any> {
    const payload = { sale, saleDetail}
    return this.http.post<Sale>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Response from backend:', response)),
      catchError(this.handleError)
    );
  }
  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  cancelSale(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`,{}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteSale(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
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
