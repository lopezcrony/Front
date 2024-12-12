import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


import { environment } from '../../../environments/environment'; 
import { Shopping } from "../shoppings/shopping.model";
import { AuthService } from '../../Auth/auth.service';
import { Shoppingdetails } from '../shoppingdetails/shoppingsDetail.model';


@Injectable({
  providedIn: 'root'
})
export class ShoppingsService {

  private apiUrl=`${environment.apiUrl}/compras`;


  constructor(private http:HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllShoppings(): Observable<Shopping[]> {
    return this.http.get<Shopping[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getShoppingdetailsByShopping(idCompra: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/detallecompras/${idCompra}`);
  }

  getOneShopping(id: number): Observable<Shopping> {
    return this.http.get<Shopping>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createShopping(shopping: Shopping, shoppingDetail: Shoppingdetails[]): Observable<any> {
    const payload = { shopping, shoppingDetail };
    console.log('Sending to backend:', payload);
    return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Response from backend:', response)),
      catchError(this.handleError)
    );
  }

  updateStatusShopping(id: number, status: boolean): Observable<Shopping> {
    const body = { estadoCompra: status };
    
    return this.http.patch<Shopping>(`${this.apiUrl}/${id}`, body, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getAllProviders(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/proveedores`).pipe(
      catchError(this.handleError)
    );
  }

  // Metodo para cancelar una compra
  cancelShopping(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`,{}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  checkShoppingExists(numeroFactura: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/shoppings/exists/${encodeURIComponent(numeroFactura)}`, { headers: this.getHeaders() });
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
