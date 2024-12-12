import { Injectable } from '@angular/core';

import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment'; 
import { Shoppingdetails } from "./shoppingsDetail.model";
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class ShoppingdetailsService {


  private apiUrl=`${environment.apiUrl}/detallecompras`;

  constructor(private http:HttpClient, private authService: AuthService, private toastr: ToastrService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllShoppingDetails(): Observable<Shoppingdetails[]> {
    return this.http.get<Shoppingdetails[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getOneShoppingDetail(id: number): Observable<Shoppingdetails> {
    return this.http.get<Shoppingdetails>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createShoppingDetail(Shoppingdetails: any): Observable<Shoppingdetails> {
    return this.http.post<Shoppingdetails>(this.apiUrl, Shoppingdetails, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getDetailByShopping(idCompra: number) {
    return this.http.get<Shoppingdetails[]>(`${this.apiUrl}/${idCompra}`);
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
