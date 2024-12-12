import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CreditDetail } from './creditDetail.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Auth/auth.service';


@Injectable({
    providedIn: 'root'
})
export class CreditDetailService {

    private creditDetailUrl = `${environment.apiUrl}/detallecredito`;

    constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) { }

    private getHeaders(): HttpHeaders {
      const token = this.authService.getToken(); 
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    
    addSaleToCredit(creditDetail: any): Observable<CreditDetail> {
        return this.http.post<CreditDetail>(this.creditDetailUrl, creditDetail, { headers: this.getHeaders() }).pipe(
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
