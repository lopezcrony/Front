import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Barcode } from './barcode.model';
import { catchError, Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class BarcodesService {

  private apiUrl = `${environment.apiUrl}/codigo_barra`; 

  
  constructor(private http:HttpClient, private toastr: ToastrService) { }


  getAllBarcodes(): Observable<Barcode[]> {
    return this.http.get<Barcode[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getOneBarcode(id: number): Observable<Barcode> {
    return this.http.get<Barcode>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Función parar obtener un producto por su código de barras
  getProductByBarcode(barcode: string): any {
    return this.http.get(`${this.apiUrl}/codigo/${barcode}`).pipe(
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
